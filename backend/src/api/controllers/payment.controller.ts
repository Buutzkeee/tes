import { Request, Response } from 'express';
import { prisma } from '../../app';
import Stripe from 'stripe';
import config from '../../config/config';

// Inicializar o Stripe
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16'
});

// Obter todos os planos disponíveis
export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    
    return res.status(200).json({
      error: false,
      plans
    });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar planos'
    });
  }
};

// Obter detalhes de um plano específico
export const getPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const plan = await prisma.plan.findUnique({
      where: { id }
    });
    
    if (!plan) {
      return res.status(404).json({
        error: true,
        message: 'Plano não encontrado'
      });
    }
    
    return res.status(200).json({
      error: false,
      plan
    });
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar plano'
    });
  }
};

// Obter a assinatura atual do usuário
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      include: {
        plan: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!subscription) {
      return res.status(404).json({
        error: true,
        message: 'Nenhuma assinatura encontrada'
      });
    }
    
    return res.status(200).json({
      error: false,
      subscription
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar assinatura'
    });
  }
};

// Criar uma sessão de checkout do Stripe
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { planId } = req.body;
    
    if (!planId) {
      return res.status(400).json({
        error: true,
        message: 'ID do plano é obrigatório'
      });
    }
    
    // Buscar o plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });
    
    if (!plan) {
      return res.status(404).json({
        error: true,
        message: 'Plano não encontrado'
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
    
    // Verificar se o usuário já tem um customer ID no Stripe
    let stripeCustomerId = null;
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId, stripeCustomerId: { not: null } }
    });
    
    if (existingSubscription && existingSubscription.stripeCustomerId) {
      stripeCustomerId = existingSubscription.stripeCustomerId;
    } else {
      // Criar um novo customer no Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });
      
      stripeCustomerId = customer.id;
    }
    
    // Criar um produto no Stripe (se ainda não existir)
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description
    });
    
    // Criar um preço no Stripe
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(plan.price * 100), // Converter para centavos
      currency: 'brl',
      recurring: {
        interval: 'month'
      }
    });
    
    // Criar uma sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment/cancel`,
      metadata: {
        userId: user.id,
        planId: plan.id
      }
    });
    
    return res.status(200).json({
      error: false,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao criar sessão de checkout'
    });
  }
};

// Webhook para eventos do Stripe
export const handleStripeWebhook = async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).json({
        error: true,
        message: 'Assinatura do Stripe não fornecida'
      });
    }
    
    // Verificar a assinatura do webhook
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret
      );
    } catch (err) {
      return res.status(400).json({
        error: true,
        message: `Erro na assinatura do webhook: ${err.message}`
      });
    }
    
    // Processar o evento
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extrair metadados
        const userId = session.metadata.userId;
        const planId = session.metadata.planId;
        
        if (!userId || !planId) {
          console.error('Metadados incompletos na sessão de checkout');
          break;
        }
        
        // Atualizar ou criar a assinatura
        await prisma.subscription.upsert({
          where: {
            userId_planId: {
              userId,
              planId
            }
          },
          update: {
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
          },
          create: {
            userId,
            planId,
            status: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
          }
        });
        
        // Registrar o pagamento
        await prisma.payment.create({
          data: {
            userId,
            amount: session.amount_total / 100, // Converter de centavos para reais
            status: 'COMPLETED',
            paymentMethod: 'card',
            stripePaymentId: session.payment_intent as string
          }
        });
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // Buscar a assinatura pelo ID do Stripe
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });
        
        if (!dbSubscription) {
          console.error('Assinatura não encontrada para atualização');
          break;
        }
        
        // Atualizar o status da assinatura
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 
                   subscription.status === 'canceled' ? 'CANCELED' : 
                   subscription.status === 'unpaid' ? 'EXPIRED' : 'PENDING'
          }
        });
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Buscar a assinatura pelo ID do Stripe
        const dbSubscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        });
        
        if (!dbSubscription) {
          console.error('Assinatura não encontrada para exclusão');
          break;
        }
        
        // Marcar a assinatura como cancelada
        await prisma.subscription.update({
          where: { id: dbSubscription.id },
          data: {
            status: 'CANCELED',
            endDate: new Date()
          }
        });
        
        break;
      }
    }
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook do Stripe:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao processar webhook'
    });
  }
};

// Cancelar assinatura
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Buscar a assinatura ativa do usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        stripeSubscriptionId: { not: null }
      }
    });
    
    if (!subscription) {
      return res.status(404).json({
        error: true,
        message: 'Nenhuma assinatura ativa encontrada'
      });
    }
    
    // Cancelar a assinatura no Stripe
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    
    // Atualizar o status da assinatura no banco de dados
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        endDate: new Date()
      }
    });
    
    return res.status(200).json({
      error: false,
      message: 'Assinatura cancelada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao cancelar assinatura'
    });
  }
};

// Obter histórico de pagamentos
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json({
      error: false,
      payments
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar histórico de pagamentos'
    });
  }
};
