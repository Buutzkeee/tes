import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';
import { Search, BookOpen, Download, ExternalLink } from 'lucide-react';

export default function Jurisprudence() {
  const router = useRouter();
  const { processId, query: initialQuery } = router.query;
  
  const [processList, setProcessList] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState(processId || '');
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [processesResponse, courtsResponse] = await Promise.all([
          api.get('/processes'),
          api.get('/ai/courts')
        ]);
        
        setProcessList(processesResponse.data.processes);
        setCourts(courtsResponse.data.courts);
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
    
    if (initialQuery) {
      setSearchQuery(initialQuery);
      handleSearch();
    }
  }, [processId, initialQuery]);

  const handleProcessChange = (e) => {
    setSelectedProcess(e.target.value);
  };

  const handleQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCourtChange = (courtId) => {
    setSelectedCourts(prev => {
      if (prev.includes(courtId)) {
        return prev.filter(id => id !== courtId);
      } else {
        return [...prev, courtId];
      }
    });
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Digite um termo para buscar jurisprudência.');
      return;
    }

    setSearching(true);
    setError(null);
    setSuccess(null);
    setSearchResults([]);

    try {
      const response = await api.post('/ai/search-jurisprudence', {
        query: searchQuery,
        processId: selectedProcess || undefined,
        courts: selectedCourts.length > 0 ? selectedCourts : undefined,
        dateRange: dateRange !== 'all' ? dateRange : undefined
      });

      setSearchResults(response.data.results);
      
      if (response.data.results.length === 0) {
        setSuccess('Busca concluída, mas nenhum resultado encontrado. Tente modificar os termos da busca.');
      } else {
        setSuccess(`Busca concluída. ${response.data.results.length} resultados encontrados.`);
      }
    } catch (err) {
      console.error('Erro ao buscar jurisprudência:', err);
      setError(err.response?.data?.message || 'Não foi possível realizar a busca. Tente novamente mais tarde.');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveResult = async (result) => {
    try {
      setLoading(true);
      await api.post('/documents', {
        title: `Jurisprudência: ${result.title}`,
        description: `Tribunal: ${result.court}, Processo: ${result.number}`,
        type: 'JURISPRUDENCE',
        processId: selectedProcess || undefined,
        content: `
Título: ${result.title}
Tribunal: ${result.court}
Número do Processo: ${result.number}
Data de Julgamento: ${result.date}
Relator: ${result.judge}

EMENTA:
${result.summary}

ÍNTEGRA:
${result.content}

URL: ${result.url}
        `
      });

      setSuccess('Jurisprudência salva como documento com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar jurisprudência:', err);
      setError('Não foi possível salvar a jurisprudência como documento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
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
            <h1 className="text-2xl font-semibold text-gray-900">Busca de Jurisprudência</h1>
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

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="process" className="block text-sm font-medium text-gray-700">
                        Processo (opcional)
                      </label>
                      <select
                        id="process"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedProcess}
                        onChange={handleProcessChange}
                        disabled={loading || searching}
                      >
                        <option value="">Todos os processos</option>
                        {processList.map(process => (
                          <option key={process.id} value={process.id}>
                            {process.number} - {process.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tribunais
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {courts.map(court => (
                          <div key={court.id} className="flex items-center">
                            <input
                              id={`court-${court.id}`}
                              type="checkbox"
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              checked={selectedCourts.includes(court.id)}
                              onChange={() => handleCourtChange(court.id)}
                              disabled={loading || searching}
                            />
                            <label htmlFor={`court-${court.id}`} className="ml-2 block text-sm text-gray-700">
                              {court.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">
                        Período
                      </label>
                      <select
                        id="dateRange"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        disabled={loading || searching}
                      >
                        <option value="all">Qualquer período</option>
                        <option value="last_year">Último ano</option>
                        <option value="last_3_years">Últimos 3 anos</option>
                        <option value="last_5_years">Últimos 5 anos</option>
                        <option value="last_10_years">Últimos 10 anos</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-1 mr-4">
                      <Input
                        id="searchQuery"
                        placeholder="Digite termos para buscar jurisprudência..."
                        value={searchQuery}
                        onChange={handleQueryChange}
                        disabled={loading || searching}
                        fullWidth
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      loading={searching}
                      disabled={loading || searching || !searchQuery.trim()}
                    >
                      <Search className="h-5 w-5 mr-1" />
                      Buscar
                    </Button>
                  </div>
                  
                  <div className="mt-6">
                    {searching ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        <p className="mt-4 text-sm text-gray-500">Buscando jurisprudência...</p>
                        <p className="text-xs text-gray-400 mt-2">Isso pode levar alguns segundos.</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-6">
                        {searchResults.map((result, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <h3 className="text-base font-medium text-gray-900">{result.title}</h3>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(result.url, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Ver Original
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveResult(result)}
                                  disabled={loading}
                                >
                                  Salvar
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap text-sm text-gray-500">
                              <span className="mr-4">Tribunal: {result.court}</span>
                              <span className="mr-4">Processo: {result.number}</span>
                              <span className="mr-4">Data: {formatDate(result.date)}</span>
                              <span>Relator: {result.judge || 'N/A'}</span>
                            </div>
                            
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700">Ementa:</h4>
                              <p className="mt-1 text-sm text-gray-600">{result.summary}</p>
                            </div>
                            
                            <div className="mt-3">
                              <Button
                                size="sm"
                                variant="link"
                                onClick={() => {
                                  const element = document.getElementById(`content-${index}`);
                                  if (element) {
                                    element.classList.toggle('hidden');
                                  }
                                }}
                              >
                                Ver/Ocultar Íntegra
                              </Button>
                              <div id={`content-${index}`} className="mt-2 text-sm text-gray-600 hidden">
                                <div className="whitespace-pre-wrap border-l-2 border-gray-200 pl-4">
                                  {result.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum resultado encontrado</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchQuery ? 'Tente modificar os termos da busca ou os filtros aplicados.' : 'Digite termos para buscar jurisprudência relevante.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Dicas para Busca de Jurisprudência</h2>
              
              <div className="text-sm text-gray-500">
                <p>Para obter melhores resultados na busca de jurisprudência:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Use termos específicos relacionados ao tema jurídico que está pesquisando</li>
                  <li>Inclua números de artigos de leis relevantes (ex: "artigo 927 código civil")</li>
                  <li>Utilize operadores como "E", "OU" para refinar sua busca</li>
                  <li>Coloque frases exatas entre aspas (ex: "dano moral")</li>
                  <li>Filtre por tribunais específicos quando souber onde a jurisprudência é mais relevante</li>
                  <li>Limite o período de tempo para obter decisões mais recentes e atualizadas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
