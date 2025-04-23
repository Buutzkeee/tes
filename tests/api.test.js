import { test, expect } from '@playwright/test';

// Testes de integração da API
test.describe('Testes de integração da API', () => {
  const baseUrl = 'http://localhost:3001/api';
  let authToken = '';
  
  // Obter token de autenticação antes dos testes
  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${baseUrl}/auth/login`, {
      data: {
        email: 'advogado@teste.com',
        password: 'senha123'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    authToken = data.token;
    expect(authToken).toBeTruthy();
  });

  // Testes da API de clientes
  test('deve listar clientes via API', async ({ request }) => {
    const response = await request.get(`${baseUrl}/clients`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.clients).toBeDefined();
    expect(Array.isArray(data.clients)).toBeTruthy();
  });

  test('deve criar um cliente via API', async ({ request }) => {
    const clientData = {
      name: 'Cliente API Test',
      email: `cliente.api.${Date.now()}@teste.com`,
      cpf: '98765432100',
      phone: '11987654321',
      address: 'Rua de Teste API, 456'
    };
    
    const response = await request.post(`${baseUrl}/clients`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: clientData
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.client).toBeDefined();
    expect(data.client.id).toBeDefined();
    expect(data.client.name).toBe(clientData.name);
  });

  // Testes da API de processos
  test('deve listar processos via API', async ({ request }) => {
    const response = await request.get(`${baseUrl}/processes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.processes).toBeDefined();
    expect(Array.isArray(data.processes)).toBeTruthy();
  });

  test('deve criar um processo via API', async ({ request }) => {
    // Primeiro, obter um cliente para associar ao processo
    const clientsResponse = await request.get(`${baseUrl}/clients`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const clientsData = await clientsResponse.json();
    expect(clientsData.clients.length).toBeGreaterThan(0);
    
    const clientId = clientsData.clients[0].id;
    
    const processData = {
      number: `${Date.now()}-12.2025.8.26.0100`,
      title: 'Processo API Test',
      description: 'Descrição do processo de teste via API',
      type: 'Cível',
      court: 'TJSP',
      clientId: clientId,
      status: 'ACTIVE'
    };
    
    const response = await request.post(`${baseUrl}/processes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: processData
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.process).toBeDefined();
    expect(data.process.id).toBeDefined();
    expect(data.process.number).toBe(processData.number);
  });

  // Testes da API de documentos
  test('deve listar documentos via API', async ({ request }) => {
    const response = await request.get(`${baseUrl}/documents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.documents).toBeDefined();
    expect(Array.isArray(data.documents)).toBeTruthy();
  });

  // Testes da API de IA
  test('deve obter resposta do chat de IA via API', async ({ request }) => {
    const response = await request.post(`${baseUrl}/ai/chat`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        message: 'Quais são os prazos processuais no processo civil?'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.response).toBeDefined();
    expect(typeof data.response).toBe('string');
    expect(data.response.length).toBeGreaterThan(0);
  });

  // Testes da API de pagamentos
  test('deve listar planos de assinatura via API', async ({ request }) => {
    const response = await request.get(`${baseUrl}/payments/plans`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.plans).toBeDefined();
    expect(Array.isArray(data.plans)).toBeTruthy();
  });
});
