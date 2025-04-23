import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import config from './config/config';

// Importação das rotas (serão implementadas posteriormente)
import authRoutes from './api/routes/auth.routes';
import userRoutes from './api/routes/user.routes';
import clientRoutes from './api/routes/client.routes';
import processRoutes from './api/routes/process.routes';
import documentRoutes from './api/routes/document.routes';
import appointmentRoutes from './api/routes/appointment.routes';
import planRoutes from './api/routes/plan.routes';
import paymentRoutes from './api/routes/payment.routes';
import aiRoutes from './api/routes/ai.routes';
import adminRoutes from './api/routes/admin.routes';

// Inicialização do Prisma Client
export const prisma = new PrismaClient();

// Inicialização do Express
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API está funcionando corretamente' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Ocorreu um erro no servidor',
  });
});

// Inicialização do servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} em modo ${config.server.nodeEnv}`);
});

// Tratamento de encerramento do processo
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Conexão com o banco de dados fechada');
  process.exit(0);
});

export default app;
