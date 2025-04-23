import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de admin requerem autenticação e permissão de administrador
router.use(authenticate);
router.use(isAdmin);

// Rotas para o painel administrativo
router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/plans', adminController.getPlans);
router.post('/plans', adminController.upsertPlan);
router.get('/logs', adminController.getActivityLogs);

export default router;
