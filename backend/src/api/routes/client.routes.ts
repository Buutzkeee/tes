import { Router } from 'express';
import * as clientController from '../controllers/client.controller';
import { authenticate, hasResourceAccess, hasActiveSubscription, checkPlanLimits } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de cliente requerem autenticação
router.use(authenticate);
router.use(hasActiveSubscription);

// Rotas para gerenciamento de clientes
router.get('/', clientController.getClients);
router.get('/:id', hasResourceAccess('client'), clientController.getClient);
router.post('/', checkPlanLimits('client'), clientController.createClient);
router.put('/:id', hasResourceAccess('client'), clientController.updateClient);
router.delete('/:id', hasResourceAccess('client'), clientController.deleteClient);

export default router;
