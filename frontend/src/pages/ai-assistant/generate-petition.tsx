import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import { FileText, Download } from 'lucide-react';

export default function GeneratePetition() {
  const router = useRouter();
  const { processId } = router.query;
  
  const [processList, setProcessList] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(processId || '');
  const [petitionTypes, setPetitionTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generatedPetition, setGeneratedPetition] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [processesResponse, typesResponse] = await Promise.all([
          api.get('/processes'),
          api.get('/ai/petition-types')
        ]);
        
        setProcessList(processesResponse.data.processes);
        setPetitionTypes(typesResponse.data.types);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Não foi possível carregar os dados necessários. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (processId) {
      setSelectedProcess(processId);
    }
  }, [processId]);

  const handleProcessChange = (e) => {
    setSelectedProcess(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleInstructionsChange = (e) => {
    setCustomInstructions(e.target.value);
  };

  const handleGeneratePetition = async () => {
    if (!selectedProcess) {
      setError('Selecione um processo para gerar a petição.');
      return;
    }

    if (!selectedType) {
      setError('Selecione um tipo de petição.');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);
    setGeneratedPetition(null);

    try {
      const response = await api.post('/ai/generate-petition', {
        processId: selectedProcess,
        petitionType: selectedType,
        customInstructions: customInstructions || undefined
      });

      setGeneratedPetition(response.data.petition);
      setSuccess('Petição gerada com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar petição:', err);
      setError(err.response?.data?.message || 'Não foi possível gerar a petição. Tente novamente mais tarde.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPetition = () => {
    if (!generatedPetition) return;

    const blob = new Blob([generatedPetition.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedPetition.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePetition = async () => {
    if (!generatedPetition) return;

    try {
      setLoading(true);
      await api.post('/documents', {
        title: generatedPetition.title,
        description: `Petição gerada por IA: ${selectedType}`,
        type: 'PETITION',
        processId: selectedProcess,
        content: generatedPetition.content
      });

      setSuccess('Petição salva como documento com sucesso!');
      
      // Limpar o formulário após salvar
      setTimeout(() => {
        setSelectedType('');
        setCustomInstructions('');
        setGeneratedPetition(null);
      }, 2000);
    } catch (err) {
      console.error('Erro ao salvar petição:', err);
      setError('Não foi possível salvar a petição como documento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Geração de Petições com IA</h1>
            <Button
              variant="outline"
              onClick={() => router.push('/ai-assistant')}
            >
              Voltar para Assistente IA
            </Button>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              className="mt-4"
              onClose={() => setError(null)}
            />
          )}

          {success && (
            <Alert
              type="success"
              message={success}
              className="mt-4"
              onClose={() => setSuccess(null)}
            />
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações da Petição</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="process" className="block text-sm font-medium text-gray-700">
                      Processo *
                    </label>
                    <select
                      id="process"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={selectedProcess}
                      onChange={handleProcessChange}
                      disabled={loading || generating}
                    >
                      <option value="">Selecione um processo</option>
                      {processList.map(process => (
                        <option key={process.id} value={process.id}>
                          {process.number} - {process.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="petitionType" className="block text-sm font-medium text-gray-700">
                      Tipo de Petição *
                    </label>
                    <select
                      id="petitionType"
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={selectedType}
                      onChange={handleTypeChange}
                      disabled={loading || generating}
                    >
                      <option value="">Selecione um tipo</option>
                      {petitionTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                      Instruções Adicionais (opcional)
                    </label>
                    <textarea
                      id="instructions"
                      rows={4}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Adicione instruções específicas para a geração da petição..."
                      value={customInstructions}
                      onChange={handleInstructionsChange}
                      disabled={loading || generating}
                    />
                  </div>
                  
                  <div>
                    <Button
                      onClick={handleGeneratePetition}
                      loading={generating}
                      disabled={loading || generating || !selectedProcess || !selectedType}
                      fullWidth
                    >
                      Gerar Petição
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Petição Gerada</h2>
                  {generatedPetition && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadPetition}
                        disabled={loading}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSavePetition}
                        disabled={loading}
                      >
                        Salvar como Documento
                      </Button>
                    </div>
                  )}
                </div>
                
                {generating ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-sm text-gray-500">Gerando petição com IA...</p>
                    <p className="text-xs text-gray-400 mt-2">Isso pode levar alguns segundos.</p>
                  </div>
                ) : generatedPetition ? (
                  <div className="border border-gray-200 rounded-md p-4 h-96 overflow-y-auto">
                    <h3 className="text-base font-medium text-gray-900 mb-2">{generatedPetition.title}</h3>
                    <div className="whitespace-pre-wrap text-sm text-gray-700">
                      {generatedPetition.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma petição gerada</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure os parâmetros ao lado e clique em "Gerar Petição" para criar uma petição com IA.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Importantes</h2>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      As petições geradas por IA são apenas sugestões e devem ser revisadas por um advogado antes de serem utilizadas.
                      O sistema não substitui o conhecimento jurídico e a análise profissional.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Dicas para obter melhores resultados:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Selecione o tipo de petição mais adequado ao seu caso</li>
                  <li>Forneça instruções específicas sobre argumentos ou pontos que deseja incluir</li>
                  <li>Verifique se o processo selecionado contém todas as informações necessárias</li>
                  <li>Sempre revise o conteúdo gerado antes de utilizar em contextos oficiais</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
