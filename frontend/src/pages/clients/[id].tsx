import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import { FileText, Folder, User, Calendar, MessageSquare } from 'lucide-react';

export default function ClientDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [client, setClient] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, processesResponse] = await Promise.all([
        api.get(`/clients/${id}`),
        api.get(`/processes?clientId=${id}`)
      ]);
      
      const clientData = clientResponse.data.client;
      setClient(clientData);
      setFormData({
        name: clientData.name || '',
        email: clientData.email || '',
        cpf: clientData.cpf || '',
        phone: clientData.phone || '',
        address: clientData.address || ''
      });
      
      setProcesses(processesResponse.data.processes || []);
    } catch (err) {
      console.error('Erro ao buscar dados do cliente:', err);
      setError('Não foi possível carregar os dados do cliente. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
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
    
    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    // Validar CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{11}$/.test(formData.cpf.replace(/[^\d]/g, ''))) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Validar telefone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
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
      await api.put(`/clients/${id}`, formData);
      setFormSuccess('Cliente atualizado com sucesso!');
      
      // Atualizar dados do cliente
      fetchClientData();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      setFormError(error.response?.data?.message || 'Erro ao atualizar cliente. Tente novamente.');
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

  if (loading && !client) {
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
              {client?.name || 'Detalhes do Cliente'}
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push('/clients')}
            >
              Voltar para Clientes
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
                  <User className="inline-block h-5 w-5 mr-2" />
                  Informações
                </button>
                <button
                  className={`${
                    activeTab === 'processes'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('processes')}
                >
                  <FileText className="inline-block h-5 w-5 mr-2" />
                  Processos
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
                    activeTab === 'appointments'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Calendar className="inline-block h-5 w-5 mr-2" />
                  Compromissos
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
                            id="name"
                            name="name"
                            label="Nome completo *"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-4">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            label="E-mail *"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <Input
                            id="cpf"
                            name="cpf"
                            label="CPF *"
                            value={formData.cpf}
                            onChange={handleChange}
                            error={errors.cpf}
                            placeholder="000.000.000-00"
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <Input
                            id="phone"
                            name="phone"
                            label="Telefone *"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            placeholder="(00) 00000-0000"
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6">
                          <Input
                            id="address"
                            name="address"
                            label="Endereço"
                            value={formData.address}
                            onChange={handleChange}
                            error={errors.address}
                            fullWidth
                          />
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

              {/* Aba de Processos */}
              {activeTab === 'processes' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Processos do Cliente
                    </h3>
                    <Button
                      onClick={() => router.push(`/processes/new?clientId=${id}`)}
                      size="sm"
                    >
                      Novo Processo
                    </Button>
                  </div>
                  <div className="border-t border-gray-200">
                    {processes.length === 0 ? (
                      <div className="px-4 py-5 sm:p-6 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Comece adicionando um novo processo para este cliente.
                        </p>
                        <div className="mt-6">
                          <Button
                            onClick={() => router.push(`/processes/new?clientId=${id}`)}
                          >
                            Novo Processo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {processes.map((process) => (
                          <li key={process.id}>
                            <a
                              href={`/processes/${process.id}`}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-indigo-600 truncate">
                                      {process.number}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {process.title}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      process.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                      process.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      process.status === 'CLOSED' ? 'bg-gray-100 text-gray-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {process.status === 'ACTIVE' ? 'Ativo' :
                                       process.status === 'PENDING' ? 'Pendente' :
                                       process.status === 'CLOSED' ? 'Encerrado' :
                                       'Arquivado'}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      Tipo: {process.type}
                                    </p>
                                  </div>
                                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                    <p>
                                      Criado em: {formatDate(process.createdAt)}
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

              {/* Aba de Documentos */}
              {activeTab === 'documents' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Documentos do Cliente
                    </h3>
                    <Button
                      onClick={() => router.push(`/documents/new?clientId=${id}`)}
                      size="sm"
                    >
                      Novo Documento
                    </Button>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <Folder className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Comece adicionando documentos para este cliente.
                      </p>
                      <div className="mt-6">
                        <Button
                          onClick={() => router.push(`/documents/new?clientId=${id}`)}
                        >
                          Novo Documento
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Aba de Compromissos */}
              {activeTab === 'appointments' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Compromissos com o Cliente
                    </h3>
                    <Button
                      onClick={() => router.push(`/calendar/new?clientId=${id}`)}
                      size="sm"
                    >
                      Novo Compromisso
                    </Button>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum compromisso encontrado</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Comece agendando compromissos com este cliente.
                      </p>
                      <div className="mt-6">
                        <Button
                          onClick={() => router.push(`/calendar/new?clientId=${id}`)}
                        >
                          Agendar Compromisso
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
