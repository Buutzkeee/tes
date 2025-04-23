import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processList, setProcessList] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await api.get('/processes');
        setProcessList(response.data.processes);
      } catch (err) {
        console.error('Erro ao buscar processos:', err);
        setError('Não foi possível carregar a lista de processos. Tente novamente mais tarde.');
      }
    };

    fetchProcesses();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await api.post('/ai/chat', {
        message: input,
        processId: selectedProcess || undefined
      });
      
      const aiMessage = {
        id: Date.now() + 1,
        content: response.data.response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Erro ao enviar mensagem para IA:', err);
      setError('Não foi possível obter resposta da IA. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProcessChange = (e) => {
    setSelectedProcess(e.target.value);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Assistente Jurídico IA</h1>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              className="mt-4"
              onClose={() => setError(null)}
            />
          )}

          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
            <div className="px-4 py-3 bg-indigo-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot className="h-5 w-5 text-indigo-600 mr-2" />
                  <h2 className="text-lg font-medium text-indigo-900">Assistente Jurídico</h2>
                </div>
                <div className="w-64">
                  <select
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedProcess}
                    onChange={handleProcessChange}
                  >
                    <option value="">Todos os processos</option>
                    {processList.map(process => (
                      <option key={process.id} value={process.id}>
                        {process.number} - {process.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot className="h-16 w-16 text-indigo-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Assistente Jurídico IA</h3>
                  <p className="mt-1 text-sm text-gray-500 max-w-md">
                    Olá! Sou seu assistente jurídico com IA. Posso ajudar com análise de processos, 
                    busca de jurisprudência, geração de petições e muito mais. Como posso ajudar hoje?
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-lg">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setInput("Quais são os prazos processuais mais importantes que devo observar?")}
                    >
                      Prazos processuais importantes
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setInput("Como elaborar uma petição inicial para ação de cobrança?")}
                    >
                      Elaborar petição inicial
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setInput("Busque jurisprudência sobre usucapião extraordinário")}
                    >
                      Buscar jurisprudência
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setInput("Quais são os requisitos para concessão de liminar em mandado de segurança?")}
                    >
                      Requisitos para liminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-3/4 rounded-lg px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4 mr-1" />
                          ) : (
                            <Bot className="h-4 w-4 mr-1" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.sender === 'user' ? 'Você' : 'Assistente'} • {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="px-4 py-3 bg-white border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-1">
                  <textarea
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Digite sua mensagem..."
                    rows={2}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>
                <div className="ml-3">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || loading}
                    loading={loading}
                    className="h-full"
                  >
                    {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
