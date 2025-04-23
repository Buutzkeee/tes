import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authenticate, hasActiveSubscription, isAdmin } from '../middlewares/auth.middleware';
import bodyParser from 'body-parser';

const router = Router();

// Rota pública para webhook do Stripe (precisa do raw body)
router.post(
  '/webhook',
  bodyParser.raw({ type: 'application/json' }),
  paymentController.handleStripeWebhook
);

// Rotas que requerem autenticação
router.use(authenticate);

// Rotas para planos e assinaturas
router.get('/plans', paymentController.getPlans);
router.get('/plans/:id', paymentController.getPlan);
router.get('/subscription', paymentController.getCurrentSubscription);
router.post('/checkout', paymentController.createCheckoutSession);
router.post('/cancel', hasActiveSubscription, paymentController.cancelSubscription);
router.get('/history', paymentController.getPaymentHistory);

export default router;
