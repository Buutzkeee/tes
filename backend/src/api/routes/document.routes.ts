import { Router } from 'express';
import * as documentController from '../controllers/document.controller';
import { authenticate, hasResourceAccess, hasActiveSubscription, checkPlanLimits } from '../middlewares/auth.middleware';
import multer from 'multer';

const router = Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB
  }
});

// Todas as rotas de documento requerem autenticação
router.use(authenticate);
router.use(hasActiveSubscription);

// Rotas para gerenciamento de documentos
router.get('/', documentController.getDocuments);
router.get('/:id', hasResourceAccess('document'), documentController.getDocument);
router.get('/:id/download', hasResourceAccess('document'), documentController.downloadDocument);
router.post('/', checkPlanLimits('document'), upload.single('file'), documentController.uploadDocument);
router.delete('/:id', hasResourceAccess('document'), documentController.deleteDocument);

export default router;
