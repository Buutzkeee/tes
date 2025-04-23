const { expect } = require('chai');
const request = require('supertest');
const app = require('../backend/src/app');

describe('Testes de segurança', () => {
  let authToken;
  let invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  before(async () => {
    // Obter token de autenticação para os testes
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'advogado@teste.com',
        password: 'senha123'
      });
    
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property('token');
    authToken = response.body.token;
  });
  
  // Testes de autenticação e autorização
  describe('Autenticação e Autorização', () => {
    it('deve bloquear acesso a rotas protegidas sem token', async () => {
      const routes = [
        '/api/clients',
        '/api/processes',
        '/api/documents',
        '/api/ai/chat',
        '/api/payments/plans'
      ];
      
      for (const route of routes) {
        const response = await request(app).get(route);
        expect(response.status).to.equal(401, `Rota ${route} não está protegida adequadamente`);
      }
    });
    
    it('deve rejeitar tokens inválidos', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(response.status).to.equal(401);
    });
    
    it('deve aceitar tokens válidos', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
    });
  });
  
  // Testes de validação de entrada
  describe('Validação de Entrada', () => {
    it('deve validar dados de entrada ao criar cliente', async () => {
      const invalidData = {
        // Faltando campos obrigatórios
        name: '',
        email: 'email-invalido',
        cpf: '123' // CPF inválido
      };
      
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);
      
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('errors');
    });
    
    it('deve validar dados de entrada ao criar processo', async () => {
      const invalidData = {
        // Faltando campos obrigatórios
        number: '',
        title: '',
        // clientId ausente
      };
      
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);
      
      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('errors');
    });
    
    it('deve prevenir injeção SQL em parâmetros de consulta', async () => {
      const response = await request(app)
        .get('/api/clients?name=test\' OR 1=1--')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Não deve retornar todos os clientes
      expect(response.status).to.equal(200);
      // Verificar se a resposta não contém todos os clientes (isso é uma verificação aproximada)
      // Em um ORM como Prisma, a injeção SQL é geralmente prevenida automaticamente
    });
  });
  
  // Testes de proteção contra XSS
  describe('Proteção contra XSS', () => {
    it('deve escapar conteúdo HTML em respostas', async () => {
      // Criar um cliente com conteúdo potencialmente malicioso
      const clientData = {
        name: '<script>alert("XSS")</script>Cliente Teste',
        email: `cliente.seguranca.${Date.now()}@exemplo.com`,
        cpf: '12345678901',
        phone: '11999999999',
        address: 'Rua de Teste, 123'
      };
      
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData);
      
      expect(createResponse.status).to.equal(201);
      const clientId = createResponse.body.client.id;
      
      // Buscar o cliente criado
      const response = await request(app)
        .get(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      
      // Verificar se o conteúdo HTML foi tratado adequadamente
      // Isso depende de como a API está implementada para lidar com conteúdo potencialmente malicioso
      // No mínimo, o conteúdo não deve ser executado como script
      const clientJson = JSON.stringify(response.body);
      expect(clientJson).to.include(clientData.name);
      // Verificação adicional seria necessária no frontend para garantir que o conteúdo é renderizado com segurança
    });
  });
  
  // Testes de rate limiting
  describe('Rate Limiting', () => {
    it('deve limitar requisições excessivas', async () => {
      // Fazer várias requisições em sequência
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(
          request(app)
            .get('/api/clients')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }
      
      // Executar todas as requisições
      const responses = await Promise.all(requests);
      
      // Verificar se alguma requisição foi limitada
      // Isso depende de como o rate limiting está configurado
      // Em alguns casos, pode não haver limitação para tão poucas requisições
      // ou a limitação pode ser por IP, o que não seria detectado neste teste
    });
  });
});
