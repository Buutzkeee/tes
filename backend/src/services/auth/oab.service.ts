import axios from 'axios';
import config from '../../config/config';

// Interface para o resultado da validação da OAB
interface OABValidationResult {
  isValid: boolean;
  isVerified: boolean;
  message: string;
}

/**
 * Valida o registro do advogado na OAB (simulado)
 * @param oabNumber Número da OAB
 * @param oabState Estado da OAB
 * @param cpf CPF do advogado
 * @returns Resultado da validação
 */
export const validateOAB = async (
  oabNumber: string,
  oabState: string,
  cpf: string
): Promise<OABValidationResult> => {
  try {
    // Em um ambiente real, faríamos uma chamada para a API da OAB
    // Aqui vamos simular a resposta
    
    // Simulação de chamada à API
    console.log(`Validando OAB: ${oabNumber}/${oabState} para CPF: ${cpf}`);
    
    // Simulação de validação
    // Em um cenário real, isso seria substituído por uma chamada à API da OAB
    const isValid = true; // Simulando que todos os registros são válidos
    const isVerified = true; // Simulando que todos os registros são verificados
    
    // Simular um atraso de rede (100-300ms)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
    
    return {
      isValid,
      isVerified,
      message: isValid 
        ? 'Registro na OAB validado com sucesso' 
        : 'Registro na OAB inválido ou inativo'
    };
    
    /* 
    // Código para implementação real com a API da OAB
    const response = await axios.post(
      `${config.oab.apiUrl}/validate`,
      {
        oabNumber,
        oabState,
        cpf
      },
      {
        headers: {
          'Authorization': `Bearer ${config.oab.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return {
      isValid: response.data.isValid,
      isVerified: response.data.isVerified,
      message: response.data.message
    };
    */
  } catch (error) {
    console.error('Erro ao validar registro na OAB:', error);
    
    // Em caso de erro, retornar como válido para não bloquear o desenvolvimento
    return {
      isValid: true,
      isVerified: true,
      message: 'Validação simulada devido a erro na API da OAB'
    };
  }
};
