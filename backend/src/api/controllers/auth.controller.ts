import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../app';
import config from '../../config/config';
import { validateOAB } from '../../services/auth/oab.service';

// Registro de novo advogado
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, cpf, oabNumber, oabState } = req.body;

    // Verificar se os campos obrigatórios foram fornecidos
    if (!name || !email || !password || !cpf || !oabNumber || !oabState) {
      return res.status(400).json({
        error: true,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Verificar se o e-mail já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'Este e-mail já está em uso'
      });
    }

    // Verificar se o CPF já está em uso
    const existingCpf = await prisma.user.findUnique({
      where: { cpf }
    });

    if (existingCpf) {
      return res.status(400).json({
        error: true,
        message: 'Este CPF já está cadastrado'
      });
    }

    // Verificar se o número da OAB já está em uso
    const existingOab = await prisma.user.findUnique({
      where: { oabNumber }
    });

    if (existingOab) {
      return res.status(400).json({
        error: true,
        message: 'Este número da OAB já está cadastrado'
      });
    }

    // Validar registro na OAB (simulado)
    const oabValidation = await validateOAB(oabNumber, oabState, cpf);

    if (!oabValidation.isValid) {
      return res.status(400).json({
        error: true,
        message: 'Registro na OAB inválido ou inativo',
        details: oabValidation.message
      });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, config.auth.saltRounds);

    // Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        oabNumber,
        oabState,
        isVerified: oabValidation.isVerified
      }
    });

    // Criar plano gratuito de teste por 7 dias
    const freePlan = await prisma.plan.findFirst({
      where: { name: 'Teste Gratuito' }
    });

    if (freePlan) {
      // Calcular data de término (7 dias a partir de hoje)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Criar assinatura gratuita
      await prisma.subscription.create({
        data: {
          userId: newUser.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          endDate
        }
      });
    }

    // Remover a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      error: false,
      message: 'Usuário registrado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao registrar usuário'
    });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Verificar se os campos obrigatórios foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    // Buscar o usuário pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    // Verificar se o usuário existe
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        error: true,
        message: 'Usuário inativo. Entre em contato com o suporte.'
      });
    }

    // Verificar a senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    // Gerar refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, tokenType: 'refresh' },
      config.auth.jwtSecret,
      { expiresIn: config.auth.refreshTokenExpiresIn }
    );

    // Remover a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      error: false,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao fazer login'
    });
  }
};

// Renovar token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: true,
        message: 'Refresh token não fornecido'
      });
    }

    // Verificar e decodificar o refresh token
    const decoded = jwt.verify(refreshToken, config.auth.jwtSecret) as any;

    // Verificar se é um refresh token
    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({
        error: true,
        message: 'Token inválido'
      });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: true,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Gerar novo token JWT
    const newToken = jwt.sign(
      { userId: user.id, role: user.role },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    return res.status(200).json({
      error: false,
      message: 'Token renovado com sucesso',
      token: newToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Refresh token expirado, faça login novamente'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Refresh token inválido'
      });
    }

    console.error('Erro ao renovar token:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao renovar token'
    });
  }
};

// Obter perfil do usuário
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }

    // Remover a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      error: false,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao obter perfil do usuário'
    });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Verificar se o e-mail já está em uso por outro usuário
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          error: true,
          message: 'Este e-mail já está em uso por outro usuário'
        });
      }
    }

    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || undefined,
        email: email || undefined
      }
    });

    // Remover a senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      error: false,
      message: 'Perfil atualizado com sucesso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar perfil do usuário'
    });
  }
};

// Alterar senha
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar a senha atual
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        error: true,
        message: 'Senha atual incorreta'
      });
    }

    // Criptografar a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, config.auth.saltRounds);

    // Atualizar a senha
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({
      error: false,
      message: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao alterar senha'
    });
  }
};
