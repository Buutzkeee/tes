import { Request, Response } from 'express';
import { prisma } from '../../app';

// Obter todos os clientes do usuário
export const getClients = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    });
    
    return res.status(200).json({
      error: false,
      clients
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar clientes'
    });
  }
};

// Obter um cliente específico
export const getClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const client = await prisma.client.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        processes: true,
        documents: true,
        appointments: true
      }
    });
    
    if (!client) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    return res.status(200).json({
      error: false,
      client
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar cliente'
    });
  }
};

// Criar um novo cliente
export const createClient = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { name, cpf, email, phone, address } = req.body;
    
    // Verificar campos obrigatórios
    if (!name || !cpf || !email || !phone) {
      return res.status(400).json({
        error: true,
        message: 'Nome, CPF, e-mail e telefone são obrigatórios'
      });
    }
    
    // Verificar se já existe um cliente com o mesmo CPF para este usuário
    const existingClient = await prisma.client.findFirst({
      where: {
        userId,
        cpf
      }
    });
    
    if (existingClient) {
      return res.status(400).json({
        error: true,
        message: 'Já existe um cliente com este CPF'
      });
    }
    
    // Criar o cliente
    const newClient = await prisma.client.create({
      data: {
        userId,
        name,
        cpf,
        email,
        phone,
        address
      }
    });
    
    return res.status(201).json({
      error: false,
      message: 'Cliente criado com sucesso',
      client: newClient
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao criar cliente'
    });
  }
};

// Atualizar um cliente
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, email, phone, address } = req.body;
    
    // Verificar se o cliente existe
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!client) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    // Atualizar o cliente
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined
      }
    });
    
    return res.status(200).json({
      error: false,
      message: 'Cliente atualizado com sucesso',
      client: updatedClient
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar cliente'
    });
  }
};

// Excluir um cliente
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar se o cliente existe
    const client = await prisma.client.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!client) {
      return res.status(404).json({
        error: true,
        message: 'Cliente não encontrado'
      });
    }
    
    // Verificar se há processos associados a este cliente
    const processCount = await prisma.process.count({
      where: { clientId: id }
    });
    
    if (processCount > 0) {
      return res.status(400).json({
        error: true,
        message: 'Não é possível excluir um cliente com processos associados'
      });
    }
    
    // Excluir documentos associados ao cliente
    await prisma.document.deleteMany({
      where: { clientId: id }
    });
    
    // Excluir compromissos associados ao cliente
    await prisma.appointment.deleteMany({
      where: { clientId: id }
    });
    
    // Excluir o cliente
    await prisma.client.delete({
      where: { id }
    });
    
    return res.status(200).json({
      error: false,
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao excluir cliente'
    });
  }
};
