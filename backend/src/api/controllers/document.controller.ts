import { Request, Response } from 'express';
import { prisma } from '../../app';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Diretório para armazenar os documentos
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Garantir que o diretório de uploads exista
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Obter todos os documentos do usuário
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { processId, clientId } = req.query;
    
    const whereClause: any = { userId };
    
    if (processId) {
      whereClause.processId = processId as string;
    }
    
    if (clientId) {
      whereClause.clientId = clientId as string;
    }
    
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        process: {
          select: {
            id: true,
            number: true
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return res.status(200).json({
      error: false,
      documents
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar documentos'
    });
  }
};

// Obter um documento específico
export const getDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const document = await prisma.document.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        process: true,
        client: true
      }
    });
    
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Documento não encontrado'
      });
    }
    
    return res.status(200).json({
      error: false,
      document
    });
  } catch (error) {
    console.error('Erro ao buscar documento:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar documento'
    });
  }
};

// Fazer download de um documento
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const document = await prisma.document.findFirst({
      where: { 
        id,
        userId 
      }
    });
    
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Documento não encontrado'
      });
    }
    
    const filePath = document.filePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: true,
        message: 'Arquivo não encontrado no servidor'
      });
    }
    
    return res.download(filePath, path.basename(filePath));
  } catch (error) {
    console.error('Erro ao fazer download do documento:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao fazer download do documento'
    });
  }
};

// Fazer upload de um documento
export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { title, type, processId, clientId } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        error: true,
        message: 'Nenhum arquivo enviado'
      });
    }
    
    if (!title || !type) {
      return res.status(400).json({
        error: true,
        message: 'Título e tipo do documento são obrigatórios'
      });
    }
    
    // Verificar se o processo existe e pertence ao usuário (se fornecido)
    if (processId) {
      const process = await prisma.process.findFirst({
        where: {
          id: processId,
          userId
        }
      });
      
      if (!process) {
        return res.status(404).json({
          error: true,
          message: 'Processo não encontrado'
        });
      }
    }
    
    // Verificar se o cliente existe e pertence ao usuário (se fornecido)
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId
        }
      });
      
      if (!client) {
        return res.status(404).json({
          error: true,
          message: 'Cliente não encontrado'
        });
      }
    }
    
    // Gerar um nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    
    // Mover o arquivo para o diretório de uploads
    fs.writeFileSync(filePath, file.buffer);
    
    // Criar o documento no banco de dados
    const document = await prisma.document.create({
      data: {
        userId,
        processId: processId || null,
        clientId: clientId || null,
        title,
        type,
        filePath,
        fileSize: file.size
      }
    });
    
    return res.status(201).json({
      error: false,
      message: 'Documento enviado com sucesso',
      document
    });
  } catch (error) {
    console.error('Erro ao fazer upload do documento:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao fazer upload do documento'
    });
  }
};

// Excluir um documento
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar se o documento existe e pertence ao usuário
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!document) {
      return res.status(404).json({
        error: true,
        message: 'Documento não encontrado'
      });
    }
    
    // Excluir o arquivo físico
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Excluir o documento do banco de dados
    await prisma.document.delete({
      where: { id }
    });
    
    return res.status(200).json({
      error: false,
      message: 'Documento excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir documento:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao excluir documento'
    });
  }
};
