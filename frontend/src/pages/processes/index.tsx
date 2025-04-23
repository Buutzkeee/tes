import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';

export default function Processes() {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProcesses, setFilteredProcesses] = useState([]);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/processes');
        setProcesses(response.data.processes);
        setFilteredProcesses(response.data.processes);
      } catch (err) {
        console.error('Erro ao buscar processos:', err);
        setError('Não foi possível carregar a lista de processos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProcesses(processes);
    } else {
      const filtered = processes.filter(
        process =>
          process.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (process.client && process.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProcesses(filtered);
    }
  }, [searchTerm, processes]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteProcess = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este processo?')) {
      return;
    }

    try {
      await api.delete(`/processes/${id}`);
      setProcesses(processes.filter(process => process.id !== id));
      setFilteredProcesses(filteredProcesses.filter(process => process.id !== id));
    } catch (err) {
      console.error('Erro ao excluir processo:', err);
      setError('Não foi possível excluir o processo. Tente novamente mais tarde.');
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

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Processos</h1>
            <Button
              onClick={() => window.location.href = '/processes/new'}
              className="flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Processo
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
            <div className="flex justify-between items-center mb-4">
              <div className="w-full max-w-md">
                <Input
                  type="text"
                  placeholder="Buscar por número, título ou cliente..."
                  value={searchTerm}
                  onChange={handleSearch}
                  fullWidth
                  className="pl-10"
                  icon={<Search className="h-5 w-5 text-gray-400" />}
                />
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {loading ? (
                <div className="px-4 py-5 sm:p-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : filteredProcesses.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum processo encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Tente uma busca diferente ou' : 'Comece a'} adicionar novos processos.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => window.location.href = '/processes/new'}
                      className="inline-flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Novo Processo
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredProcesses.map((process) => (
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
                              {process.client && (
                                <p className="text-sm text-gray-500">
                                  Cliente: {process.client.name}
                                </p>
                              )}
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
        </div>
      </div>
    </DashboardLayout>
  );
}
