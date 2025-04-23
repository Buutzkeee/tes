import { Router } from 'express';
import * as processController from '../controllers/process.controller';
import { authenticate, hasResourceAccess, hasActiveSubscription, checkPlanLimits } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de processo requerem autenticação
router.use(authenticate);
router.use(hasActiveSubscription);

// Rotas para gerenciamento de processos
router.get('/', processController.getProcesses);
router.get('/:id', hasResourceAccess('process'), processController.getProcess);
router.post('/', checkPlanLimits('process'), processController.createProcess);
router.put('/:id', hasResourceAccess('process'), processController.updateProcess);

// Rotas para análise de IA e prazos
router.post('/:id/analyze', hasResourceAccess('process'), processController.analyzeProcessWithAI);
router.post('/:id/deadlines', hasResourceAccess('process'), processController.addDeadline);
router.put('/:processId/deadlines/:deadlineId/complete', processController.completeDeadline);

export default router;
