import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import api from '@/services/api';
import { Plus, Search, Download, Trash2, Folder } from 'lucide-react';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Alert from '@/components/common/Alert';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/documents');
        setDocuments(response.data.documents);
        setFilteredDocuments(response.data.documents);
      } catch (err) {
        console.error('Erro ao buscar documentos:', err);
        setError('Não foi possível carregar a lista de documentos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDocuments(documents);
    } else {
      const filtered = documents.filter(
        document =>
          document.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          document.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (document.process && document.process.number.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (document.client && document.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDocuments(filtered);
    }
  }, [searchTerm, documents]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este documento?')) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(document => document.id !== id));
      setFilteredDocuments(filteredDocuments.filter(document => document.id !== id));
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      setError('Não foi possível excluir o documento. Tente novamente mais tarde.');
    }
  };

  const handleDownloadDocument = async (id, title) => {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob'
      });
      
      // Criar URL para o blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Criar link temporário e clicar nele para iniciar o download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Limpar
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
      setError('Não foi possível baixar o documento. Tente novamente mais tarde.');
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

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${Math.round(kb)} KB`;
    } else {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Documentos</h1>
            <Button
              onClick={() => window.location.href = '/documents/new'}
              className="flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Documento
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
                  placeholder="Buscar por título, tipo, processo ou cliente..."
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
              ) : filteredDocuments.length === 0 ? (
                <div className="px-4 py-5 sm:p-6 text-center">
                  <Folder className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum documento encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Tente uma busca diferente ou' : 'Comece a'} adicionar novos documentos.
                  </p>
                  <div className="mt-6">
                    <Button
                      onClick={() => window.location.href = '/documents/new'}
                      className="inline-flex items-center"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Novo Documento
                    </Button>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <li key={document.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {document.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {document.description}
                          </p>
                          {document.process && (
                            <p className="text-sm text-gray-500">
                              Processo: {document.process.number}
                            </p>
                          )}
                          {document.client && (
                            <p className="text-sm text-gray-500">
                              Cliente: {document.client.name}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 mr-2">
                            {document.type}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => handleDownloadDocument(document.id, document.title)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Tamanho: {formatFileSize(document.fileSize)}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Enviado em: {formatDate(document.createdAt)}
                          </p>
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
