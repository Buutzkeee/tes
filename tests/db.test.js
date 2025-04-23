const { expect } = require('chai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Testes de banco de dados', () => {
  // Limpar dados de teste após cada suite
  after(async () => {
    // Limpar apenas os dados criados pelos testes
    await prisma.document.deleteMany({
      where: {
        title: {
          contains: 'Teste DB'
        }
      }
    });
    
    await prisma.process.deleteMany({
      where: {
        title: {
          contains: 'Teste DB'
        }
      }
    });
    
    await prisma.client.deleteMany({
      where: {
        name: {
          contains: 'Cliente Teste DB'
        }
      }
    });
  });
  
  describe('Modelo de Cliente', () => {
    let createdClientId;
    
    it('deve criar um novo cliente no banco de dados', async () => {
      const client = await prisma.client.create({
        data: {
          name: 'Cliente Teste DB',
          email: `cliente.db.${Date.now()}@exemplo.com`,
          cpf: '11122233344',
          phone: '11999999999',
          address: 'Rua Teste DB, 123',
          userId: 1 // Assumindo que existe um usuário com ID 1
        }
      });
      
      expect(client).to.have.property('id');
      expect(client.name).to.equal('Cliente Teste DB');
      
      createdClientId = client.id;
    });
    
    it('deve buscar um cliente pelo ID', async () => {
      const client = await prisma.client.findUnique({
        where: {
          id: createdClientId
        }
      });
      
      expect(client).to.not.be.null;
      expect(client.id).to.equal(createdClientId);
      expect(client.name).to.equal('Cliente Teste DB');
    });
    
    it('deve atualizar um cliente existente', async () => {
      const updatedClient = await prisma.client.update({
        where: {
          id: createdClientId
        },
        data: {
          phone: '11988888888',
          address: 'Rua Teste DB Atualizada, 456'
        }
      });
      
      expect(updatedClient.phone).to.equal('11988888888');
      expect(updatedClient.address).to.equal('Rua Teste DB Atualizada, 456');
    });
  });
  
  describe('Modelo de Processo', () => {
    let clientId;
    let processId;
    
    before(async () => {
      // Criar um cliente para associar aos processos
      const client = await prisma.client.create({
        data: {
          name: 'Cliente Teste DB para Processos',
          email: `cliente.db.processos.${Date.now()}@exemplo.com`,
          cpf: '99988877766',
          phone: '11977777777',
          address: 'Rua Teste DB Processos, 789',
          userId: 1 // Assumindo que existe um usuário com ID 1
        }
      });
      
      clientId = client.id;
    });
    
    it('deve criar um novo processo no banco de dados', async () => {
      const process = await prisma.process.create({
        data: {
          number: `${Date.now()}-22.2025.8.26.0100`,
          title: 'Processo Teste DB',
          description: 'Descrição do processo de teste de banco de dados',
          type: 'Cível',
          court: 'TJSP',
          status: 'ACTIVE',
          clientId: clientId,
          userId: 1 // Assumindo que existe um usuário com ID 1
        }
      });
      
      expect(process).to.have.property('id');
      expect(process.title).to.equal('Processo Teste DB');
      expect(process.clientId).to.equal(clientId);
      
      processId = process.id;
    });
    
    it('deve buscar um processo com dados do cliente', async () => {
      const process = await prisma.process.findUnique({
        where: {
          id: processId
        },
        include: {
          client: true
        }
      });
      
      expect(process).to.not.be.null;
      expect(process.id).to.equal(processId);
      expect(process.client).to.not.be.null;
      expect(process.client.id).to.equal(clientId);
    });
    
    it('deve atualizar o status de um processo', async () => {
      const updatedProcess = await prisma.process.update({
        where: {
          id: processId
        },
        data: {
          status: 'PENDING'
        }
      });
      
      expect(updatedProcess.status).to.equal('PENDING');
    });
  });
  
  describe('Modelo de Documento', () => {
    let clientId;
    let processId;
    
    before(async () => {
      // Criar um cliente e um processo para associar aos documentos
      const client = await prisma.client.create({
        data: {
          name: 'Cliente Teste DB para Documentos',
          email: `cliente.db.docs.${Date.now()}@exemplo.com`,
          cpf: '55566677788',
          phone: '11966666666',
          address: 'Rua Teste DB Docs, 321',
          userId: 1 // Assumindo que existe um usuário com ID 1
        }
      });
      
      clientId = client.id;
      
      const process = await prisma.process.create({
        data: {
          number: `${Date.now()}-33.2025.8.26.0100`,
          title: 'Processo Teste DB para Documentos',
          description: 'Descrição do processo para teste de documentos',
          type: 'Cível',
          court: 'TJSP',
          status: 'ACTIVE',
          clientId: clientId,
          userId: 1 // Assumindo que existe um usuário com ID 1
        }
      });
      
      processId = process.id;
    });
    
    it('deve criar um novo documento no banco de dados', async () => {
      const document = await prisma.document.create({
        data: {
          title: 'Documento Teste DB',
          description: 'Descrição do documento de teste de banco de dados',
          type: 'PETITION',
          fileUrl: 'https://exemplo.com/documento-teste.pdf',
          fileSize: 1024,
          processId: processId,
          clientId: clientId,
          userId: 1 // Assumindo que existe um usuário com ID 1
        }
      });
      
      expect(document).to.have.property('id');
      expect(document.title).to.equal('Documento Teste DB');
      expect(document.processId).to.equal(processId);
      expect(document.clientId).to.equal(clientId);
    });
    
    it('deve buscar documentos por processo', async () => {
      const documents = await prisma.document.findMany({
        where: {
          processId: processId
        }
      });
      
      expect(documents).to.be.an('array');
      expect(documents.length).to.be.at.least(1);
      expect(documents[0].processId).to.equal(processId);
    });
  });
});
