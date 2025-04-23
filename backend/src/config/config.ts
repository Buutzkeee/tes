import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  
  // Configurações de autenticação
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
    jwtExpiresIn: '1d', // Token expira em 1 dia
    refreshTokenExpiresIn: '7d', // Refresh token expira em 7 dias
    saltRounds: 10, // Rounds para o bcrypt
  },
  
  // Configurações do banco de dados
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Configurações de integração com a OAB (simulada)
  oab: {
    apiUrl: process.env.OAB_API_URL || 'https://api.oab.org.br',
    apiKey: process.env.OAB_API_KEY || 'oab_api_key_simulated',
  },
  
  // Configurações do Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_simulated',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_simulated',
  },
  
  // Configurações da OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'openai_api_key_simulated',
  },
  
  // Configurações de e-mail
  email: {
    host: process.env.EMAIL_HOST || 'smtp.example.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || 'no-reply@advogados-saas.com',
    password: process.env.EMAIL_PASSWORD || 'email_password',
    from: process.env.EMAIL_FROM || 'Advogados SaaS <no-reply@advogados-saas.com>',
  },
};

export default config;
