import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import { FileText, Folder, Calendar, MessageSquare, Clock } from 'lucide-react';

export default function ProcessDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [process, setProcess] = useState(null);
  const [client, setClient] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    description: '',
    type: '',
    court: '',
    clientId: '',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProcessData();
      fetchClients();
    }
  }, [id]);

  const fetchProcessData = async () => {
    try {
      setLoading(true);
      const [processResponse, documentsResponse, deadlinesResponse] = await Promise.all([
        api.get(`/processes/${id}`),
        api.get(`/documents?processId=${id}`),
        api.get(`/processes/${id}/deadlines`)
      ]);
      
      const processData = processResponse.data.process;
      setProcess(processData);
      setClient(processData.client);
      setFormData({
        number: processData.number || '',
        title: processData.title || '',
        description: processData.description || '',
        type: processData.type || '',
        court: processData.court || '',
        clientId: processData.clientId || '',
        status: processData.status || 'ACTIVE'
      });
      
      setDocuments(documentsResponse.data.documents || []);
      setDeadlines(deadlinesResponse.data.deadlines || []);
    } catch (err) {
      console.error('Erro ao buscar dados do processo:', err);
      setError('Não foi possível carregar os dados do processo. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const response = await api.get('/clients');
      setClients(response.data.clients);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro específico quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar número do processo
    if (!formData.number.trim()) {
      newErrors.number = 'Número do processo é obrigatório';
    }
    
    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    // Validar tipo
    if (!formData.type.trim()) {
      newErrors.type = 'Tipo é obrigatório';
    }
    
    // Validar tribunal
    if (!formData.court.trim()) {
      newErrors.court = 'Tribunal é obrigatório';
    }
    
    // Validar cliente
    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await api.put(`/processes/${id}`, formData);
      setFormSuccess('Processo atualizado com sucesso!');
      
      // Atualizar dados do processo
      fetchProcessData();
    } catch (error) {
      console.error('Erro ao atualizar processo:', error);
      setFormError(error.response?.data?.message || 'Erro ao atualizar processo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && !process) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {process?.title || 'Detalhes do Processo'}
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push('/processes')}
            >
              Voltar para Processos
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

          <div className="mt-6">
            {/* Abas */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  className={`${
                    activeTab === 'info'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('info')}
                >
                  <FileText className="inline-block h-5 w-5 mr-2" />
                  Informações
                </button>
                <button
                  className={`${
                    activeTab === 'documents'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('documents')}
                >
                  <Folder className="inline-block h-5 w-5 mr-2" />
                  Documentos
                </button>
                <button
                  className={`${
                    activeTab === 'deadlines'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('deadlines')}
                >
                  <Clock className="inline-block h-5 w-5 mr-2" />
                  Prazos
                </button>
                <button
                  className={`${
                    activeTab === 'ai'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('ai')}
                >
                  <MessageSquare className="inline-block h-5 w-5 mr-2" />
                  Assistente IA
                </button>
              </nav>
            </div>

            {/* Conteúdo das abas */}
            <div className="mt-6">
              {/* Aba de Informações */}
              {activeTab === 'info' && (
                <form onSubmit={handleSubmit}>
                  <div className="shadow overflow-hidden sm:rounded-md">
                    <div className="px-4 py-5 bg-white sm:p-6">
                      {formError && (
                        <Alert
                          type="error"
                          message={formError}
                          className="mb-4"
                          onClose={() => setFormError('')}
                        />
                      )}
                      
                      {formSuccess && (
                        <Alert
                          type="success"
                          message={formSuccess}
                          className="mb-4"
                          onClose={() => setFormSuccess('')}
                        />
                      )}
                      
                      <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6 sm:col-span-4">
                          <Input
                            id="number"
                            name="number"
                            label="Número do Processo *"
                            value={formData.number}
                            onChange={handleChange}
                            error={errors.number}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <Input
                            id="title"
                            name="title"
                            label="Título *"
                            value={formData.title}
                            onChange={handleChange}
                            error={errors.title}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Descrição
                          </label>
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.description}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <Input
                            id="type"
                            name="type"
                            label="Tipo de Processo *"
                            value={formData.type}
                            onChange={handleChange}
                            error={errors.type}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <Input
                            id="court"
                            name="court"
                            label="Tribunal *"
                            value={formData.court}
                            onChange={handleChange}
                            error={errors.court}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                            Cliente *
                          </label>
                          <select
                            id="clientId"
                            name="clientId"
                            className={`mt-1 block w-full py-2 px-3 border ${
                              errors.clientId ? 'border-red-300' : 'border-gray-300'
                            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            value={formData.clientId}
                            onChange={handleChange}
                            disabled={loadingClients}
                          >
                            <option value="">Selecione um cliente</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                          {errors.clientId && (
                            <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
                          )}
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            id="status"
                            name="status"
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={formData.status}
                            onChange={handleChange}
                          >
                            <option value="ACTIVE">Ativo</option>
                            <option value="PENDING">Pendente</option>
                            <option value="CLOSED">Encerrado</option>
                            <option value="ARCHIVED">Arquivado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Aba de Documentos */}
              {activeTab === 'documents' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Documentos do Processo
                    </h3>
                    <Button
                      onClick={() => router.push(`/documents/new?processId=${id}`)}
                      size="sm"
                    >
                      Novo Documento
                    </Button>
                  </div>
                  <div className="border-t border-gray-200">
                    {documents.length === 0 ? (
                      <div className="px-4 py-5 sm:p-6 text-center">
                        <Folder className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Comece adicionando documentos para este processo.
                        </p>
                        <div className="mt-6">
                          <Button
                            onClick={() => router.push(`/documents/new?processId=${id}`)}
                          >
                            Novo Documento
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {documents.map((document) => (
                          <li key={document.id}>
                            <a
                              href={`/documents/${document.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {document.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {document.description}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {document.type}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Tamanho: {document.fileSize ? `${Math.round(document.fileSize / 1024)} KB` : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                      Enviado em: {formatDate(document.createdAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Aba de Prazos */}
              {activeTab === 'deadlines' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Prazos do Processo
                    </h3>
                    <Button
                      onClick={() => router.push(`/deadlines/new?processId=${id}`)}
                      size="sm"
                    >
                      Novo Prazo
                    </Button>
                  </div>
                  <div className="border-t border-gray-200">
                    {deadlines.length === 0 ? (
                      <div className="px-4 py-5 sm:p-6 text-center">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum prazo encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Comece adicionando prazos para este processo.
                        </p>
                        <div className="mt-6">
                          <Button
                            onClick={() => router.push(`/deadlines/new?processId=${id}`)}
                          >
                            Novo Prazo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {deadlines.map((deadline) => (
                          <li key={deadline.id}>
                            <a
                              href={`/deadlines/${deadline.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {deadline.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {deadline.description}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      new Date(deadline.dueDate) < new Date() ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {formatDate(deadline.dueDate)}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Tipo: {deadline.type}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p className={`${
                                      deadline.completed ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {deadline.completed ? 'Concluído' : 'Pendente'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Aba de Assistente IA */}
              {activeTab === 'ai' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Assistente Jurídico IA
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Use nosso assistente de IA para analisar o processo, gerar petições ou buscar jurisprudência.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-base font-medium text-gray-900 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-indigo-500" />
                          Análise de Processo
                        </h4>
                        <p className="mt-2 text-sm text-gray-500">
                          Obtenha uma análise detalhada do processo com recomendações estratégicas.
                        </p>
                        <Button
                          className="mt-4 w-full"
                          onClick={() => router.push(`/ai-assistant/analyze?processId=${id}`)}
                        >
                          Analisar Processo
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-base font-medium text-gray-900 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-indigo-500" />
                          Geração de Petições
                        </h4>
                        <p className="mt-2 text-sm text-gray-500">
                          Gere petições básicas com base nos dados do processo.
                        </p>
                        <Button
                          className="mt-4 w-full"
                          onClick={() => router.push(`/ai-assistant/generate-petition?processId=${id}`)}
                        >
                          Gerar Petição
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-base font-medium text-gray-900 flex items-center">
                          <Search className="h-5 w-5 mr-2 text-indigo-500" />
                          Busca de Jurisprudência
                        </h4>
                        <p className="mt-2 text-sm text-gray-500">
                          Encontre jurisprudência relevante para o seu caso.
                        </p>
                        <Button
                          className="mt-4 w-full"
                          onClick={() => router.push(`/ai-assistant/jurisprudence?processId=${id}`)}
                        >
                          Buscar Jurisprudência
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-base font-medium text-gray-900 flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2 text-indigo-500" />
                          Chat Jurídico
                        </h4>
                        <p className="mt-2 text-sm text-gray-500">
                          Converse com nosso assistente jurídico sobre este processo.
                        </p>
                        <Button
                          className="mt-4 w-full"
                          onClick={() => router.push(`/ai-assistant/chat?processId=${id}`)}
                        >
                          Iniciar Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
