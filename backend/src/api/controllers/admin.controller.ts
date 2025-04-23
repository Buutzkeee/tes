import { Request, Response } from 'express';
import { prisma } from '../../app';

// Obter estatísticas gerais do sistema
export const getStats = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    // Contar usuários
    const userCount = await prisma.user.count();
    
    // Contar assinaturas ativas
    const activeSubscriptionCount = await prisma.subscription.count({
      where: { status: 'ACTIVE' }
    });
    
    // Contar processos
    const processCount = await prisma.process.count();
    
    // Contar clientes
    const clientCount = await prisma.client.count();
    
    // Calcular faturamento total
    const payments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' }
    });
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Obter distribuição de planos
    const planDistribution = await prisma.subscription.groupBy({
      by: ['planId'],
      _count: {
        planId: true
      }
    });
    
    // Obter nomes dos planos
    const plans = await prisma.plan.findMany();
    const planMap = plans.reduce((map, plan) => {
      map[plan.id] = plan.name;
      return map;
    }, {});
    
    const planStats = planDistribution.map(item => ({
      planName: planMap[item.planId] || 'Desconhecido',
      count: item._count.planId
    }));
    
    return res.status(200).json({
      error: false,
      stats: {
        userCount,
        activeSubscriptionCount,
        processCount,
        clientCount,
        totalRevenue,
        planStats
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao obter estatísticas'
    });
  }
};

// Listar todos os usuários
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    const { page = '1', limit = '10', search } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Construir a cláusula where
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { oabNumber: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    
    // Contar total de usuários
    const totalUsers = await prisma.user.count({
      where: whereClause
    });
    
    // Buscar usuários com paginação
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        subscription: {
          include: {
            plan: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNumber
    });
    
    // Remover senhas dos objetos de usuário
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    
    return res.status(200).json({
      error: false,
      users: usersWithoutPasswords,
      pagination: {
        total: totalUsers,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(totalUsers / limitNumber)
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao listar usuários'
    });
  }
};

// Obter detalhes de um usuário específico
export const getUser = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: {
          include: {
            plan: true
          }
        },
        clients: {
          select: {
            id: true,
            name: true
          }
        },
        processes: {
          select: {
            id: true,
            number: true,
            status: true
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
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
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      error: false,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar usuário'
    });
  }
};

// Atualizar status de um usuário
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (isActive === undefined) {
      return res.status(400).json({
        error: true,
        message: 'Status (isActive) é obrigatório'
      });
    }
    
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado'
      });
    }
    
    // Não permitir desativar o próprio usuário
    if (user.id === req.user.id && !isActive) {
      return res.status(400).json({
        error: true,
        message: 'Não é possível desativar seu próprio usuário'
      });
    }
    
    // Atualizar o status do usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive }
    });
    
    // Remover a senha do objeto de resposta
    const { password, ...userWithoutPassword } = updatedUser;
    
    return res.status(200).json({
      error: false,
      message: `Usuário ${isActive ? 'ativado' : 'desativado'} com sucesso`,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar status do usuário'
    });
  }
};

// Gerenciar planos
export const getPlans = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    const plans = await prisma.plan.findMany({
      orderBy: { price: 'asc' }
    });
    
    return res.status(200).json({
      error: false,
      plans
    });
  } catch (error) {
    console.error('Erro ao listar planos:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao listar planos'
    });
  }
};

// Criar ou atualizar plano
export const upsertPlan = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    const { id, name, description, price, features, isActive } = req.body;
    
    if (!name || !description || price === undefined || !features) {
      return res.status(400).json({
        error: true,
        message: 'Nome, descrição, preço e recursos são obrigatórios'
      });
    }
    
    // Criar ou atualizar o plano
    const plan = await prisma.plan.upsert({
      where: { id: id || 'non-existent-id' },
      update: {
        name,
        description,
        price,
        features,
        isActive: isActive !== undefined ? isActive : true
      },
      create: {
        name,
        description,
        price,
        features,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    return res.status(200).json({
      error: false,
      message: id ? 'Plano atualizado com sucesso' : 'Plano criado com sucesso',
      plan
    });
  } catch (error) {
    console.error('Erro ao gerenciar plano:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao gerenciar plano'
    });
  }
};

// Obter logs de atividade
export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    // Verificar se o usuário é administrador
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: true,
        message: 'Acesso negado. Permissão de administrador necessária'
      });
    }
    
    // Em um sistema real, teríamos uma tabela de logs
    // Aqui vamos simular alguns logs
    
    const logs = [
      {
        id: '1',
        userId: 'admin',
        action: 'LOGIN',
        details: 'Login bem-sucedido',
        ip: '192.168.1.1',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        userId: 'user123',
        action: 'CREATE_PROCESS',
        details: 'Processo #12345 criado',
        ip: '192.168.1.2',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        userId: 'user456',
        action: 'PAYMENT',
        details: 'Assinatura do plano Premium',
        ip: '192.168.1.3',
        timestamp: new Date(Date.now() - 10800000)
      }
    ];
    
    return res.status(200).json({
      error: false,
      logs
    });
  } catch (error) {
    console.error('Erro ao buscar logs de atividade:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar logs de atividade'
    });
  }
};
