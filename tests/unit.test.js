const { expect } = require('chai');
const request = require('supertest');
const app = require('../backend/src/app');

describe('Testes unitários do backend', () => {
  let authToken;
  
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
  
  // Testes de autenticação
  describe('Autenticação', () => {
    it('deve retornar erro ao tentar login com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalido@teste.com',
          password: 'senhaerrada'
        });
      
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('message');
    });
    
    it('deve retornar token ao fazer login com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'advogado@teste.com',
          password: 'senha123'
        });
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.be.a('string');
    });
    
    it('deve verificar token JWT válido', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('valid', true);
    });
  });
  
  // Testes de clientes
  describe('Clientes', () => {
    it('deve listar clientes para usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('clients');
      expect(response.body.clients).to.be.an('array');
    });
    
    it('deve retornar erro ao tentar acessar clientes sem autenticação', async () => {
      const response = await request(app)
        .get('/api/clients');
      
      expect(response.status).to.equal(401);
    });
    
    it('deve criar um novo cliente', async () => {
      const clientData = {
        name: 'Cliente Teste Unitário',
        email: `cliente.teste.${Date.now()}@exemplo.com`,
        cpf: '12345678901',
        phone: '11999999999',
        address: 'Rua de Teste Unitário, 123'
      };
      
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send(clientData);
      
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('client');
      expect(response.body.client).to.have.property('id');
      expect(response.body.client.name).to.equal(clientData.name);
      expect(response.body.client.email).to.equal(clientData.email);
    });
    
    it('deve buscar um cliente pelo ID', async () => {
      // Primeiro criar um cliente para depois buscar
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Cliente para Busca',
          email: `cliente.busca.${Date.now()}@exemplo.com`,
          cpf: '98765432109',
          phone: '11988888888',
          address: 'Rua de Busca, 456'
        });
      
      expect(createResponse.status).to.equal(201);
      const clientId = createResponse.body.client.id;
      
      // Agora buscar o cliente criado
      const response = await request(app)
        .get(`/api/clients/${clientId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('client');
      expect(response.body.client).to.have.property('id', clientId);
    });
  });
  
  // Testes de processos
  describe('Processos', () => {
    let clientId;
    
    before(async () => {
      // Criar um cliente para associar aos processos
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Cliente para Processos',
          email: `cliente.processos.${Date.now()}@exemplo.com`,
          cpf: '11122233344',
          phone: '11977777777',
          address: 'Rua de Processos, 789'
        });
      
      expect(response.status).to.equal(201);
      clientId = response.body.client.id;
    });
    
    it('deve listar processos para usuário autenticado', async () => {
      const response = await request(app)
        .get('/api/processes')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('processes');
      expect(response.body.processes).to.be.an('array');
    });
    
    it('deve criar um novo processo', async () => {
      const processData = {
        number: `${Date.now()}-11.2025.8.26.0100`,
        title: 'Processo Teste Unitário',
        description: 'Descrição do processo de teste unitário',
        type: 'Trabalhista',
        court: 'TRT',
        clientId: clientId,
        status: 'ACTIVE'
      };
      
      const response = await request(app)
        .post('/api/processes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(processData);
      
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('process');
      expect(response.body.process).to.have.property('id');
      expect(response.body.process.number).to.equal(processData.number);
      expect(response.body.process.title).to.equal(processData.title);
    });
    
    it('deve buscar processos por cliente', async () => {
      const response = await request(app)
        .get(`/api/processes?clientId=${clientId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('processes');
      expect(response.body.processes).to.be.an('array');
      
      // Verificar se todos os processos retornados pertencem ao cliente
      response.body.processes.forEach(process => {
        expect(process.clientId).to.equal(clientId);
      });
    });
  });
  
  // Testes do assistente de IA
  describe('Assistente de IA', () => {
    it('deve responder a uma consulta no chat', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'O que é habeas corpus?'
        });
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('response');
      expect(response.body.response).to.be.a('string');
      expect(response.body.response.length).to.be.greaterThan(0);
    });
    
    it('deve listar tipos de petições disponíveis', async () => {
      const response = await request(app)
        .get('/api/ai/petition-types')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('types');
      expect(response.body.types).to.be.an('array');
      expect(response.body.types.length).to.be.greaterThan(0);
    });
  });
  
  // Testes de pagamentos
  describe('Pagamentos', () => {
    it('deve listar planos disponíveis', async () => {
      const response = await request(app)
        .get('/api/payments/plans')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('plans');
      expect(response.body.plans).to.be.an('array');
      expect(response.body.plans.length).to.be.greaterThan(0);
      
      // Verificar estrutura de um plano
      const plan = response.body.plans[0];
      expect(plan).to.have.property('id');
      expect(plan).to.have.property('name');
      expect(plan).to.have.property('price');
      expect(plan).to.have.property('features');
    });
    
    it('deve obter informações da assinatura atual', async () => {
      const response = await request(app)
        .get('/api/payments/subscription')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      // Pode ter ou não uma assinatura ativa
      if (response.body.subscription) {
        expect(response.body.subscription).to.have.property('id');
        expect(response.body.subscription).to.have.property('status');
        expect(response.body.subscription).to.have.property('plan');
      }
    });
  });
});
