import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate, hasActiveSubscription } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de IA requerem autenticação
router.use(authenticate);
router.use(hasActiveSubscription);

// Rotas para o assistente jurídico com IA
router.post('/chat', aiController.chatWithAI);
router.post('/generate-petition', aiController.generatePetition);
router.post('/search-jurisprudence', aiController.searchJurisprudence);
router.get('/chat-history', aiController.getChatHistory);

export default router;
