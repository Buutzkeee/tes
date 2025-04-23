const { expect } = require('chai');
const request = require('supertest');
const app = require('../backend/src/app');

describe('Testes de acessibilidade', () => {
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
  
  // Testes de estrutura de resposta da API
  describe('Estrutura de resposta da API', () => {
    it('deve retornar respostas com estrutura consistente', async () => {
      const endpoints = [
        '/api/clients',
        '/api/processes',
        '/api/documents',
        '/api/payments/plans'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${authToken}`);
        
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('object');
        
        // Verificar se a resposta tem uma estrutura consistente
        // Cada endpoint deve retornar um objeto com uma propriedade específica
        if (endpoint.includes('clients')) {
          expect(response.body).to.have.property('clients');
          expect(response.body.clients).to.be.an('array');
        } else if (endpoint.includes('processes')) {
          expect(response.body).to.have.property('processes');
          expect(response.body.processes).to.be.an('array');
        } else if (endpoint.includes('documents')) {
          expect(response.body).to.have.property('documents');
          expect(response.body.documents).to.be.an('array');
        } else if (endpoint.includes('plans')) {
          expect(response.body).to.have.property('plans');
          expect(response.body.plans).to.be.an('array');
        }
      }
    });
    
    it('deve incluir mensagens de erro claras', async () => {
      // Testar endpoint com ID inválido
      const response = await request(app)
        .get('/api/clients/999999')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.be.oneOf([404, 400]);
      expect(response.body).to.have.property('message');
      expect(response.body.message).to.be.a('string');
      expect(response.body.message.length).to.be.greaterThan(0);
    });
  });
  
  // Testes de paginação
  describe('Paginação', () => {
    it('deve suportar paginação em endpoints de listagem', async () => {
      const response = await request(app)
        .get('/api/clients?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('clients');
      expect(response.body.clients).to.be.an('array');
      
      // Verificar se a quantidade de itens respeita o limite
      expect(response.body.clients.length).to.be.at.most(5);
      
      // Verificar se há informações de paginação
      expect(response.body).to.have.property('pagination');
      expect(response.body.pagination).to.have.property('totalItems');
      expect(response.body.pagination).to.have.property('totalPages');
      expect(response.body.pagination).to.have.property('currentPage');
    });
  });
  
  // Testes de filtros
  describe('Filtros', () => {
    it('deve suportar filtros em endpoints de listagem', async () => {
      // Criar um cliente com nome específico para teste
      const clientName = `Cliente Filtro ${Date.now()}`;
      const createResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: clientName,
          email: `cliente.filtro.${Date.now()}@exemplo.com`,
          cpf: '12345678901',
          phone: '11999999999',
          address: 'Rua de Teste, 123'
        });
      
      expect(createResponse.status).to.equal(201);
      
      // Buscar usando filtro por nome
      const response = await request(app)
        .get(`/api/clients?name=${encodeURIComponent(clientName)}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('clients');
      expect(response.body.clients).to.be.an('array');
      
      // Verificar se o filtro funcionou
      expect(response.body.clients.length).to.be.at.least(1);
      expect(response.body.clients[0].name).to.equal(clientName);
    });
  });
  
  // Testes de ordenação
  describe('Ordenação', () => {
    it('deve suportar ordenação em endpoints de listagem', async () => {
      // Buscar clientes ordenados por nome em ordem ascendente
      const ascResponse = await request(app)
        .get('/api/clients?sort=name&order=asc')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(ascResponse.status).to.equal(200);
      expect(ascResponse.body).to.have.property('clients');
      expect(ascResponse.body.clients).to.be.an('array');
      
      if (ascResponse.body.clients.length >= 2) {
        // Verificar se a ordenação ascendente está correta
        const firstClient = ascResponse.body.clients[0];
        const secondClient = ascResponse.body.clients[1];
        expect(firstClient.name.localeCompare(secondClient.name)).to.be.at.most(0);
      }
      
      // Buscar clientes ordenados por nome em ordem descendente
      const descResponse = await request(app)
        .get('/api/clients?sort=name&order=desc')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(descResponse.status).to.equal(200);
      expect(descResponse.body).to.have.property('clients');
      expect(descResponse.body.clients).to.be.an('array');
      
      if (descResponse.body.clients.length >= 2) {
        // Verificar se a ordenação descendente está correta
        const firstClient = descResponse.body.clients[0];
        const secondClient = descResponse.body.clients[1];
        expect(firstClient.name.localeCompare(secondClient.name)).to.be.at.least(0);
      }
    });
  });
});
