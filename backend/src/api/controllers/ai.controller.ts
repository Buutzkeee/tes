import { Request, Response } from 'express';
import { prisma } from '../../app';
import { generatePetition as generatePetitionService, searchJurisprudence as searchJurisprudenceService } from '../../services/ai/process.service';
import { OpenAI } from 'openai';
import config from '../../config/config';

// Simular chat com IA
export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: true,
        message: 'Mensagem é obrigatória'
      });
    }
    
    // Verificar se o usuário tem uma assinatura que permite uso de IA
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });
    
    if (!subscription || !subscription.plan.features.includes('AI_CHAT')) {
      return res.status(403).json({
        error: true,
        message: 'Seu plano atual não inclui chat com IA',
        requiresUpgrade: true
      });
    }
    
    // Simular resposta da IA
    const response = await simulateAIResponse(message);
    
    // Salvar histórico de chat
    await prisma.aIChatHistory.create({
      data: {
        userId,
        message,
        response
      }
    });
    
    return res.status(200).json({
      error: false,
      response
    });
  } catch (error) {
    console.error('Erro no chat com IA:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao processar mensagem'
    });
  }
};

// Gerar petição com IA
export const generatePetition = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { prompt, processId } = req.body;
    
    if (!prompt || !processId) {
      return res.status(400).json({
        error: true,
        message: 'Prompt e ID do processo são obrigatórios'
      });
    }
    
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
    
    // Verificar se o usuário tem uma assinatura que permite geração de petições
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });
    
    if (!subscription || !subscription.plan.features.includes('AI_PETITION')) {
      return res.status(403).json({
        error: true,
        message: 'Seu plano atual não inclui geração de petições',
        requiresUpgrade: true
      });
    }
    
    // Gerar a petição
    const petition = await generatePetitionService(prompt, process);
    
    return res.status(200).json({
      error: false,
      petition
    });
  } catch (error) {
    console.error('Erro ao gerar petição:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao gerar petição'
    });
  }
};

// Buscar jurisprudência
export const searchJurisprudence = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        error: true,
        message: 'Consulta é obrigatória'
      });
    }
    
    // Verificar se o usuário tem uma assinatura que permite busca de jurisprudência
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });
    
    if (!subscription || !subscription.plan.features.includes('AI_JURISPRUDENCE')) {
      return res.status(403).json({
        error: true,
        message: 'Seu plano atual não inclui busca de jurisprudência',
        requiresUpgrade: true
      });
    }
    
    // Buscar jurisprudência
    const results = await searchJurisprudenceService(query);
    
    return res.status(200).json({
      error: false,
      results
    });
  } catch (error) {
    console.error('Erro ao buscar jurisprudência:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar jurisprudência'
    });
  }
};

// Obter histórico de chat
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    const history = await prisma.aIChatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    return res.status(200).json({
      error: false,
      history
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de chat:', error);
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar histórico de chat'
    });
  }
};

// Função auxiliar para simular resposta da IA
const simulateAIResponse = async (message: string): Promise<string> => {
  // Simular um atraso de processamento (1-2 segundos)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));
  
  // Respostas simuladas com base em palavras-chave
  if (message.toLowerCase().includes('prazo')) {
    return 'Os prazos processuais são contados em dias úteis, conforme o CPC/2015. Recomendo sempre verificar o calendário forense do tribunal específico para evitar perdas de prazo. Lembre-se que alguns prazos são peremptórios e não podem ser alterados.';
  } else if (message.toLowerCase().includes('recurso')) {
    return 'Existem diversos tipos de recursos no sistema processual brasileiro, como apelação, agravo de instrumento, embargos de declaração, recurso especial e recurso extraordinário. Cada um tem requisitos específicos de admissibilidade e prazos próprios.';
  } else if (message.toLowerCase().includes('audiência')) {
    return 'Para audiências, recomendo preparar previamente as perguntas para testemunhas, revisar todos os documentos relevantes e chegar com antecedência. Lembre-se que a ausência injustificada pode gerar consequências processuais negativas.';
  } else if (message.toLowerCase().includes('contrato')) {
    return 'Na elaboração de contratos, é essencial definir claramente o objeto, as obrigações das partes, prazos, valores, condições de pagamento e cláusulas de rescisão. Recomendo também incluir cláusulas sobre foro competente e métodos alternativos de resolução de conflitos.';
  } else {
    return 'Como assistente jurídico, posso ajudar com informações sobre legislação, jurisprudência, prazos processuais e orientações gerais sobre procedimentos jurídicos. Para questões específicas, recomendo analisar a documentação completa do caso e consultar a legislação aplicável.';
  }
  
  /* 
  // Código para implementação real com a API da OpenAI
  const openai = new OpenAI({
    apiKey: config.openai.apiKey
  });
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Você é um assistente jurídico especializado em direito brasileiro. Forneça respostas precisas, citando legislação e jurisprudência quando relevante.' },
      { role: 'user', content: message }
    ],
    temperature: 0.7
  });
  
  return response.choices[0].message.content || 'Não foi possível processar sua consulta.';
  */
};
