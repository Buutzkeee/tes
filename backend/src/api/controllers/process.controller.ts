import { Request, Response } from 'express';
import { prisma } from '../../app';
import { analyzeProcess } from '../../services/ai/process.service';

// Obter todos os processos do usuário
export const getProcesses = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const processes = await prisma.process.findMany({
      where: { userId },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        deadlines: {
          where: {
            isCompleted: false,
            dueDate: {
              gte: new Date()
            }
          },
          orderBy: {
            dueDate: 'asc'
          },
          take: 3
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    return res.status(200).json({
      error: false,
      processes
    });
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar processos'
    });
  }
};

// Obter um processo específico
export const getProcess = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const process = await prisma.process.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        client: true,
        documents: true,
        appointments: true,
        deadlines: {
          orderBy: {
            dueDate: 'asc'
          }
        },
        aiAnalysis: true
      }
    });
    
    if (!process) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado'
      });
    }
    
    return res.status(200).json({
      error: false,
      process
    });
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar processo'
    });
  }
};

// Criar um novo processo
export const createProcess = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { clientId, number, court, type, subject, description } = req.body;
    
    // Verificar campos obrigatórios
    if (!clientId || !number || !court || !type || !subject) {
      return res.status(400).json({
        error: true,
        message: 'Cliente, número do processo, tribunal, tipo e assunto são obrigatórios'
      });
    }
    
    // Verificar se o cliente existe e pertence ao usuário
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
    
    // Verificar se já existe um processo com o mesmo número
    const existingProcess = await prisma.process.findUnique({
      where: { number }
    });
    
    if (existingProcess) {
      return res.status(400).json({
        error: true,
        message: 'Já existe um processo com este número'
      });
    }
    
    // Criar o processo
    const newProcess = await prisma.process.create({
      data: {
        userId,
        clientId,
        number,
        court,
        type,
        subject,
        description
      }
    });
    
    return res.status(201).json({
      error: false,
      message: 'Processo criado com sucesso',
      process: newProcess
    });
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao criar processo'
    });
  }
};

// Atualizar um processo
export const updateProcess = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { court, type, subject, description, status } = req.body;
    
    // Verificar se o processo existe e pertence ao usuário
    const process = await prisma.process.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!process) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado'
      });
    }
    
    // Atualizar o processo
    const updatedProcess = await prisma.process.update({
      where: { id },
      data: {
        court: court || undefined,
        type: type || undefined,
        subject: subject || undefined,
        description: description || undefined,
        status: status || undefined,
        endDate: status === 'CLOSED' ? new Date() : undefined
      }
    });
    
    return res.status(200).json({
      error: false,
      message: 'Processo atualizado com sucesso',
      process: updatedProcess
    });
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar processo'
    });
  }
};

// Analisar processo com IA
export const analyzeProcessWithAI = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar se o processo existe e pertence ao usuário
    const process = await prisma.process.findFirst({
      where: {
        id,
        userId
      },
      include: {
        documents: true
      }
    });
    
    if (!process) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado'
      });
    }
    
    // Verificar se o usuário tem uma assinatura que permite análise de IA
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });
    
    if (!subscription || !subscription.plan.features.includes('AI_ANALYSIS')) {
      return res.status(403).json({
        error: true,
        message: 'Seu plano atual não inclui análise de processos com IA',
        requiresUpgrade: true
      });
    }
    
    // Analisar o processo com IA
    const analysis = await analyzeProcess(process);
    
    // Salvar ou atualizar a análise no banco de dados
    const aiAnalysis = await prisma.aIProcessAnalysis.upsert({
      where: {
        processId: id
      },
      update: {
        summary: analysis.summary,
        parties: analysis.parties,
        keyDates: analysis.keyDates,
        recommendations: analysis.recommendations
      },
      create: {
        processId: id,
        summary: analysis.summary,
        parties: analysis.parties,
        keyDates: analysis.keyDates,
        recommendations: analysis.recommendations
      }
    });
    
    // Criar prazos com base nas recomendações da IA
    for (const recommendation of analysis.recommendations) {
      if (recommendation.includes('prazo') && analysis.keyDates.length > 0) {
        // Criar um prazo para cada data-chave identificada
        for (const date of analysis.keyDates) {
          await prisma.deadline.create({
            data: {
              processId: id,
              title: `Prazo identificado pela IA`,
              description: recommendation,
              dueDate: date,
              priority: 'HIGH'
            }
          });
        }
      }
    }
    
    return res.status(200).json({
      error: false,
      message: 'Processo analisado com sucesso',
      analysis: aiAnalysis
    });
  } catch (error) {
    console.error('Erro ao analisar processo com IA:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao analisar processo com IA'
    });
  }
};

// Adicionar prazo ao processo
export const addDeadline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, dueDate, priority } = req.body;
    
    // Verificar campos obrigatórios
    if (!title || !dueDate) {
      return res.status(400).json({
        error: true,
        message: 'Título e data de vencimento são obrigatórios'
      });
    }
    
    // Verificar se o processo existe e pertence ao usuário
    const process = await prisma.process.findFirst({
      where: {
        id,
        userId
      }
    });
    
    if (!process) {
      return res.status(404).json({
        error: true,
        message: 'Processo não encontrado'
      });
    }
    
    // Criar o prazo
    const deadline = await prisma.deadline.create({
      data: {
        processId: id,
        title,
        description,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM'
      }
    });
    
    // Criar notificação para o prazo
    await prisma.notification.create({
      data: {
        userId,
        title: `Novo prazo: ${title}`,
        message: `Prazo para o processo ${process.number} com vencimento em ${new Date(dueDate).toLocaleDateString('pt-BR')}`,
        type: 'DEADLINE'
      }
    });
    
    return res.status(201).json({
      error: false,
      message: 'Prazo adicionado com sucesso',
      deadline
    });
  } catch (error) {
    console.error('Erro ao adicionar prazo:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao adicionar prazo'
    });
  }
};

// Marcar prazo como concluído
export const completeDeadline = async (req: Request, res: Response) => {
  try {
    const { processId, deadlineId } = req.params;
    const userId = req.user.id;
    
    // Verificar se o processo existe e pertence ao usuário
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
    
    // Verificar se o prazo existe e pertence ao processo
    const deadline = await prisma.deadline.findFirst({
      where: {
        id: deadlineId,
        processId
      }
    });
    
    if (!deadline) {
      return res.status(404).json({
        error: true,
        message: 'Prazo não encontrado'
      });
    }
    
    // Marcar o prazo como concluído
    const updatedDeadline = await prisma.deadline.update({
      where: { id: deadlineId },
      data: { isCompleted: true }
    });
    
    return res.status(200).json({
      error: false,
      message: 'Prazo marcado como concluído',
      deadline: updatedDeadline
    });
  } catch (error) {
    console.error('Erro ao marcar prazo como concluído:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao marcar prazo como concluído'
    });
  }
};
