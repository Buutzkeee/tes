import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { CreditCard, Package, CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Alert from '@/components/common/Alert';

export default function Payments() {
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansResponse, subscriptionResponse, historyResponse] = await Promise.all([
          api.get('/payments/plans'),
          api.get('/payments/subscription'),
          api.get('/payments/history')
        ]);
        
        setPlans(plansResponse.data.plans);
        
        if (subscriptionResponse.data.subscription) {
          setCurrentSubscription(subscriptionResponse.data.subscription);
        }
        
        setPaymentHistory(historyResponse.data.payments);
      } catch (err) {
        console.error('Erro ao buscar dados de pagamento:', err);
        setError('Não foi possível carregar os dados de pagamento. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (planId) => {
    try {
      setLoading(true);
      const response = await api.post('/payments/checkout', { planId });
      
      // Redirecionar para a página de checkout do Stripe
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Erro ao iniciar checkout:', err);
      setError('Não foi possível iniciar o processo de assinatura. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium.')) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/payments/cancel');
      setSuccess('Assinatura cancelada com sucesso.');
      
      // Atualizar a assinatura atual
      const subscriptionResponse = await api.get('/payments/subscription');
      if (subscriptionResponse.data.subscription) {
        setCurrentSubscription(subscriptionResponse.data.subscription);
      } else {
        setCurrentSubscription(null);
      }
    } catch (err) {
      console.error('Erro ao cancelar assinatura:', err);
      setError('Não foi possível cancelar a assinatura. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
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

  // Formatar valor para exibição
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Assinatura e Pagamentos</h1>

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

          {/* Assinatura atual */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-indigo-50">
              <h3 className="text-lg leading-6 font-medium text-indigo-900">
                Sua Assinatura
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-indigo-700">
                Detalhes da sua assinatura atual e status.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ) : currentSubscription ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {currentSubscription.plan.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {currentSubscription.plan.description}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Preço: {formatCurrency(currentSubscription.plan.price)}/mês
                      </p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          currentSubscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {currentSubscription.status === 'ACTIVE' ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Ativa
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              {currentSubscription.status === 'CANCELED' ? 'Cancelada' : 
                               currentSubscription.status === 'PENDING' ? 'Pendente' : 'Expirada'}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    {currentSubscription.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        onClick={handleCancelSubscription}
                        disabled={loading}
                      >
                        Cancelar Assinatura
                      </Button>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700">Recursos incluídos:</h5>
                    <ul className="mt-2 space-y-1">
                      {currentSubscription.plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          {feature === 'AI_CHAT' && 'Chat com IA'}
                          {feature === 'AI_PETITION' && 'Geração de petições com IA'}
                          {feature === 'AI_JURISPRUDENCE' && 'Busca de jurisprudência com IA'}
                          {feature === 'UNLIMITED_CLIENTS' && 'Clientes ilimitados'}
                          {feature === 'UNLIMITED_PROCESSES' && 'Processos ilimitados'}
                          {feature === 'UNLIMITED_DOCUMENTS' && 'Documentos ilimitados'}
                          {feature === 'ADVANCED_REPORTS' && 'Relatórios avançados'}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma assinatura ativa</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Você ainda não possui uma assinatura ativa. Escolha um plano abaixo para começar.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Planos disponíveis */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Planos Disponíveis</h2>
            <p className="mt-1 text-sm text-gray-500">
              Escolha o plano que melhor atende às suas necessidades.
            </p>
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="animate-pulse p-6">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 bg-indigo-50">
                      <h3 className="text-lg font-medium text-indigo-900">{plan.name}</h3>
                    </div>
                    <div className="px-6 py-4">
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(plan.price)}
                        </span>
                        <span className="ml-1 text-sm text-gray-500">/mês</span>
                      </div>
                      <p className="mt-4 text-sm text-gray-500">
                        {plan.description}
                      </p>
                      
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-500">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            {feature === 'AI_CHAT' && 'Chat com IA'}
                            {feature === 'AI_PETITION' && 'Geração de petições com IA'}
                            {feature === 'AI_JURISPRUDENCE' && 'Busca de jurisprudência com IA'}
                            {feature === 'UNLIMITED_CLIENTS' && 'Clientes ilimitados'}
                            {feature === 'UNLIMITED_PROCESSES' && 'Processos ilimitados'}
                            {feature === 'UNLIMITED_DOCUMENTS' && 'Documentos ilimitados'}
                            {feature === 'ADVANCED_REPORTS' && 'Relatórios avançados'}
                          </li>
                        ))}
                      </ul>
                      
                      <div className="mt-6">
                        <Button
                          fullWidth
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={loading || (currentSubscription && currentSubscription.status === 'ACTIVE' && currentSubscription.plan.id === plan.id)}
                        >
                          {currentSubscription && currentSubscription.status === 'ACTIVE' && currentSubscription.plan.id === plan.id
                            ? 'Plano Atual'
                            : 'Assinar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Histórico de pagamentos */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Histórico de Pagamentos</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
              {loading ? (
                <div className="animate-pulse p-6 space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum pagamento encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Seu histórico de pagamentos aparecerá aqui após sua primeira assinatura.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Método
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {payment.paymentMethod === 'card' ? 'Cartão de Crédito' : payment.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'Concluído' : 
                               payment.status === 'PENDING' ? 'Pendente' : 
                               'Falhou'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
