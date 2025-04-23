import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';
import { Calendar, Clock, FileText, Users, CreditCard, MessageSquare } from 'lucide-react';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clientCount: 0,
    processCount: 0,
    upcomingDeadlines: [],
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fazer múltiplas requisições em paralelo
        const [clientsResponse, processesResponse, deadlinesResponse, appointmentsResponse] = await Promise.all([
          api.get('/clients'),
          api.get('/processes'),
          api.get('/processes/deadlines/upcoming'),
          api.get('/appointments/upcoming')
        ]);
        
        setStats({
          clientCount: clientsResponse.data.clients.length,
          processCount: processesResponse.data.processes.length,
          upcomingDeadlines: deadlinesResponse.data.deadlines || [],
          upcomingAppointments: appointmentsResponse.data.appointments || []
        });
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          
          {/* Saudação */}
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-900">
              Olá, {user?.name}! Bem-vindo ao seu painel.
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Aqui está um resumo da sua atividade e próximos compromissos.
            </p>
          </div>
          
          {error && (
            <Alert
              type="error"
              message={error}
              className="mt-4"
              onClose={() => setError(null)}
            />
          )}
          
          {/* Cards de estatísticas */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card de clientes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Clientes
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.clientCount}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a
                    href="/clients"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Ver todos os clientes
                  </a>
                </div>
              </div>
            </div>
            
            {/* Card de processos */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total de Processos
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.processCount}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a
                    href="/processes"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Ver todos os processos
                  </a>
                </div>
              </div>
            </div>
            
            {/* Card de prazos */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Prazos Pendentes
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.upcomingDeadlines.length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a
                    href="/calendar"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Ver todos os prazos
                  </a>
                </div>
              </div>
            </div>
            
            {/* Card de compromissos */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Compromissos Agendados
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {loading ? '...' : stats.upcomingAppointments.length}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <a
                    href="/calendar"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Ver agenda completa
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Seção de prazos e compromissos */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Próximos prazos */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Próximos Prazos
                </h3>
                <a
                  href="/calendar"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Ver todos
                </a>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {loading ? (
                    <li className="px-4 py-4 sm:px-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </li>
                  ) : stats.upcomingDeadlines.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                      Nenhum prazo próximo.
                    </li>
                  ) : (
                    stats.upcomingDeadlines.slice(0, 5).map((deadline) => (
                      <li key={deadline.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {deadline.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              Processo: {deadline.process.number}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {formatDate(deadline.dueDate)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
            
            {/* Próximos compromissos */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Próximos Compromissos
                </h3>
                <a
                  href="/calendar"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Ver todos
                </a>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {loading ? (
                    <li className="px-4 py-4 sm:px-6">
                      <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </li>
                  ) : stats.upcomingAppointments.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6 text-sm text-gray-500">
                      Nenhum compromisso agendado.
                    </li>
                  ) : (
                    stats.upcomingAppointments.slice(0, 5).map((appointment) => (
                      <li key={appointment.id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {appointment.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.location || 'Sem localização'}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {formatDate(appointment.date)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Seção de ações rápidas */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ações Rápidas
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="flex items-center justify-center py-4"
                onClick={() => window.location.href = '/clients/new'}
              >
                <Users className="h-5 w-5 mr-2" />
                Novo Cliente
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center py-4"
                onClick={() => window.location.href = '/processes/new'}
              >
                <FileText className="h-5 w-5 mr-2" />
                Novo Processo
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center py-4"
                onClick={() => window.location.href = '/calendar/new'}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Agendar Compromisso
              </Button>
              <Button
                variant="outline"
                className="flex items-center justify-center py-4"
                onClick={() => window.location.href = '/ai-assistant'}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Assistente IA
              </Button>
            </div>
          </div>
          
          {/* Seção de assinatura */}
          {user?.subscription && (
            <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                <h3 className="text-lg leading-6 font-medium text-indigo-900">
                  Sua Assinatura
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Plano: <span className="font-bold">{user.subscription.plan.name}</span>
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Status: {' '}
                      <span className={`font-medium ${
                        user.subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {user.subscription.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                      </span>
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.location.href = '/payments'}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
