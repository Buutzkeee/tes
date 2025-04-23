import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/clients');
        setClients(response.data.clients);
        setFilteredClients(response.data.clients);
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        setError('Não foi possível carregar a lista de clientes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        client =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.cpf.includes(searchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(client => client.id !== id));
      setFilteredClients(filteredClients.filter(client => client.id !== id));
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      setError('Não foi possível excluir o cliente. Tente novamente mais tarde.');
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Clientes</h1>
            <Button
              onClick={() => window.location.href = '/clients/new'}
              className="flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Cliente
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
                  placeholder="Buscar por nome, email ou CPF..."
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
              ) : filteredClients.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Tente uma busca diferente ou' : 'Comece a'} adicionar novos clientes.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => window.location.href = '/clients/new'}
                      className="inline-flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Novo Cliente
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <li key={client.id}>
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-700 font-medium text-sm">
                              {client.name.charAt(0)}
                              {client.name.split(' ')[1]?.charAt(0) || ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-indigo-600">
                              {client.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {client.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              CPF: {client.cpf}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/clients/${client.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClient(client.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
