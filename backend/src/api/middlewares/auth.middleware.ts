import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import { prisma } from '../../app';

// Interface para o payload do token JWT
interface TokenPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}

// Middleware para verificar autenticação
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obter o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: true, message: 'Token de autenticação não fornecido' });
    }
    
    // Verificar formato do token (Bearer <token>)
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: true, message: 'Erro no formato do token' });
    }
    
    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: true, message: 'Token mal formatado' });
    }
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
    
    // Verificar se o usuário existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: true, message: 'Usuário não encontrado ou inativo' });
    }
    
    // Adicionar informações do usuário ao objeto de requisição
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: true, message: 'Token expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: true, message: 'Token inválido' });
    }
    
    return res.status(500).json({ error: true, message: 'Erro interno do servidor' });
  }
};

// Middleware para verificar permissões de administrador
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  
  return res.status(403).json({ error: true, message: 'Acesso negado. Permissão de administrador necessária' });
};

// Middleware para verificar se o usuário tem acesso a um recurso específico
export const hasResourceAccess = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({ error: true, message: 'ID do recurso não fornecido' });
      }
      
      let hasAccess = false;
      
      // Verificar acesso com base no tipo de recurso
      switch (resourceType) {
        case 'client':
          const client = await prisma.client.findUnique({
            where: { id: resourceId }
          });
          hasAccess = client?.userId === userId;
          break;
          
        case 'process':
          const process = await prisma.process.findUnique({
            where: { id: resourceId }
          });
          hasAccess = process?.userId === userId;
          break;
          
        case 'document':
          const document = await prisma.document.findUnique({
            where: { id: resourceId }
          });
          hasAccess = document?.userId === userId;
          break;
          
        case 'appointment':
          const appointment = await prisma.appointment.findUnique({
            where: { id: resourceId }
          });
          hasAccess = appointment?.userId === userId;
          break;
          
        default:
          return res.status(400).json({ error: true, message: 'Tipo de recurso inválido' });
      }
      
      if (hasAccess || req.user.role === 'ADMIN') {
        return next();
      }
      
      return res.status(403).json({ error: true, message: 'Acesso negado a este recurso' });
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao verificar acesso ao recurso' });
    }
  };
};

// Middleware para verificar assinatura ativa
export const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Verificar se o usuário tem uma assinatura ativa
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [
          { endDate: null },
          { endDate: { gt: new Date() } }
        ]
      }
    });
    
    if (!subscription && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        error: true, 
        message: 'Assinatura ativa necessária para acessar este recurso',
        requiresSubscription: true
      });
    }
    
    // Adicionar informações da assinatura à requisição
    if (subscription) {
      req.subscription = {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status
      };
    }
    
    return next();
  } catch (error) {
    return res.status(500).json({ error: true, message: 'Erro ao verificar assinatura' });
  }
};

// Middleware para validar limites do plano
export const checkPlanLimits = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Se for admin ou não for uma requisição de criação, prosseguir
      if (req.user.role === 'ADMIN' || req.method !== 'POST') {
        return next();
      }
      
      const userId = req.user.id;
      
      // Obter a assinatura e o plano do usuário
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        }
      });
      
      if (!subscription) {
        return res.status(403).json({ 
          error: true, 
          message: 'Assinatura ativa necessária para criar este recurso',
          requiresSubscription: true
        });
      }
      
      // Verificar limites com base no tipo de recurso
      let currentCount = 0;
      let limit = 0;
      
      switch (resourceType) {
        case 'client':
          currentCount = await prisma.client.count({
            where: { userId }
          });
          limit = subscription.plan.name === 'Básico' ? 10 : 
                 subscription.plan.name === 'Profissional' ? 50 : 
                 subscription.plan.name === 'Premium' ? 100 : 0;
          break;
          
        case 'process':
          currentCount = await prisma.process.count({
            where: { userId }
          });
          limit = subscription.plan.name === 'Básico' ? 20 : 
                 subscription.plan.name === 'Profissional' ? 100 : 
                 subscription.plan.name === 'Premium' ? 500 : 0;
          break;
          
        case 'document':
          currentCount = await prisma.document.count({
            where: { userId }
          });
          limit = subscription.plan.name === 'Básico' ? 50 : 
                 subscription.plan.name === 'Profissional' ? 200 : 
                 subscription.plan.name === 'Premium' ? 1000 : 0;
          break;
          
        default:
          return next();
      }
      
      if (currentCount >= limit) {
        return res.status(403).json({ 
          error: true, 
          message: `Limite de ${resourceType} atingido para seu plano atual`,
          currentCount,
          limit,
          requiresUpgrade: true
        });
      }
      
      return next();
    } catch (error) {
      return res.status(500).json({ error: true, message: 'Erro ao verificar limites do plano' });
    }
  };
};

// Estender a interface Request para incluir informações do usuário e assinatura
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      subscription?: {
        id: string;
        planId: string;
        status: string;
      };
    }
  }
}
