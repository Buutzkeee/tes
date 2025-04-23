import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import { Upload } from 'lucide-react';

export default function NewDocument() {
  const router = useRouter();
  const { processId, clientId } = router.query;
  
  const [clients, setClients] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    processId: processId || '',
    clientId: clientId || '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [clientsResponse, processesResponse] = await Promise.all([
          api.get('/clients'),
          api.get('/processes')
        ]);
        setClients(clientsResponse.data.clients);
        setProcesses(processesResponse.data.processes);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setFormError('Não foi possível carregar os dados necessários. Tente novamente mais tarde.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (processId) {
      setFormData(prev => ({
        ...prev,
        processId: processId
      }));
    }
    
    if (clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: clientId
      }));
    }
  }, [processId, clientId]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Limpar erro do arquivo
      if (errors.file) {
        setErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    // Validar tipo
    if (!formData.type.trim()) {
      newErrors.type = 'Tipo é obrigatório';
    }
    
    // Validar arquivo
    if (!selectedFile) {
      newErrors.file = 'Arquivo é obrigatório';
    }
    
    // Validar que pelo menos um processo ou cliente está selecionado
    if (!formData.processId && !formData.clientId) {
      newErrors.processId = 'Selecione um processo ou cliente';
      newErrors.clientId = 'Selecione um processo ou cliente';
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
    setUploadProgress(0);
    
    try {
      // Criar FormData para upload de arquivo
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('type', formData.type);
      
      if (formData.processId) {
        formDataToSend.append('processId', formData.processId);
      }
      
      if (formData.clientId) {
        formDataToSend.append('clientId', formData.clientId);
      }
      
      // Configurar o upload com progresso
      await api.post('/documents', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setFormSuccess('Documento enviado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/documents');
      }, 2000);
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      setFormError(error.response?.data?.message || 'Erro ao enviar documento. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Novo Documento</h1>
          
          <div className="mt-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <div className="px-4 sm:px-0">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Informações do Documento</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Preencha os dados e faça o upload do documento. Os campos marcados com * são obrigatórios.
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
                        <div className="col-span-6">
                          <Input
                            id="title"
                            name="title"
                            label="Título do Documento *"
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
                            label="Tipo de Documento *"
                            value={formData.type}
                            onChange={handleChange}
                            error={errors.type}
                            placeholder="Ex: Petição, Contrato, Procuração"
                            fullWidth
                          />
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="processId" className="block text-sm font-medium text-gray-700">
                            Processo (opcional)
                          </label>
                          <select
                            id="processId"
                            name="processId"
                            className={`mt-1 block w-full py-2 px-3 border ${
                              errors.processId ? 'border-red-300' : 'border-gray-300'
                            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            value={formData.processId}
                            onChange={handleChange}
                            disabled={loadingData}
                          >
                            <option value="">Selecione um processo</option>
                            {processes.map(process => (
                              <option key={process.id} value={process.id}>
                                {process.number} - {process.title}
                              </option>
                            ))}
                          </select>
                          {errors.processId && (
                            <p className="mt-1 text-sm text-red-600">{errors.processId}</p>
                          )}
                        </div>
                        
                        <div className="col-span-6 sm:col-span-3">
                          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700">
                            Cliente (opcional)
                          </label>
                          <select
                            id="clientId"
                            name="clientId"
                            className={`mt-1 block w-full py-2 px-3 border ${
                              errors.clientId ? 'border-red-300' : 'border-gray-300'
                            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            value={formData.clientId}
                            onChange={handleChange}
                            disabled={loadingData}
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
                        
                        <div className="col-span-6">
                          <label className="block text-sm font-medium text-gray-700">
                            Arquivo *
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                >
                                  <span>Selecione um arquivo</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                  />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PDF, Word, TXT, JPG, PNG até 10MB
                              </p>
                              {selectedFile && (
                                <p className="text-sm text-indigo-600">
                                  Arquivo selecionado: {selectedFile.name}
                                </p>
                              )}
                              {errors.file && (
                                <p className="text-sm text-red-600">{errors.file}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isSubmitting && uploadProgress > 0 && (
                          <div className="col-span-6">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 text-right mt-1">
                              {uploadProgress}% concluído
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="mr-3"
                        onClick={() => router.push('/documents')}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Enviar
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
