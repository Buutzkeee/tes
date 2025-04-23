import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';

export default function NewProcess() {
  const router = useRouter();
  const { clientId } = router.query;
  
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    description: '',
    type: '',
    court: '',
    clientId: clientId || '',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        const response = await api.get('/clients');
        setClients(response.data.clients);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        setFormError('Não foi possível carregar a lista de clientes. Tente novamente mais tarde.');
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: clientId
      }));
    }
  }, [clientId]);

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
      await api.post('/processes', formData);
      setFormSuccess('Processo cadastrado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/processes');
      }, 2000);
    } catch (error) {
      console.error('Erro ao cadastrar processo:', error);
      setFormError(error.response?.data?.message || 'Erro ao cadastrar processo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Novo Processo</h1>
          
          <div className="mt-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Informações do Processo</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Preencha os dados do novo processo. Os campos marcados com * são obrigatórios.
                  </p>
                </div>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
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
                        type="button"
                        variant="outline"
                        className="mr-3"
                        onClick={() => router.push('/processes')}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Salvar
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
