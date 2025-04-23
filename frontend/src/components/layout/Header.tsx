import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, ChevronDown } from 'lucide-react';
import Button from '@/components/common/Button';

export default function Header() {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* Título da página atual (pode ser dinâmico) */}
              <h1 className="text-xl font-semibold text-gray-900">
                {router.pathname === '/dashboard' && 'Dashboard'}
                {router.pathname === '/clients' && 'Clientes'}
                {router.pathname === '/processes' && 'Processos'}
                {router.pathname === '/documents' && 'Documentos'}
                {router.pathname === '/calendar' && 'Agenda'}
                {router.pathname === '/payments' && 'Pagamentos'}
                {router.pathname === '/ai-assistant' && 'Assistente IA'}
                {router.pathname === '/settings' && 'Configurações'}
                {router.pathname === '/help' && 'Ajuda'}
              </h1>
            </div>
          </div>
          <div className="flex items-center">
            {/* Barra de pesquisa */}
            <div className="max-w-lg w-full lg:max-w-xs mr-4 hidden md:block">
              <label htmlFor="search" className="sr-only">
                Pesquisar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Pesquisar"
                  type="search"
                />
              </div>
            </div>

            {/* Notificações */}
            <div className="ml-4 relative flex-shrink-0">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={toggleNotifications}
              >
                <span className="sr-only">Ver notificações</span>
                <Bell className="h-6 w-6" />
              </button>

              {/* Dropdown de notificações */}
              {isNotificationsOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">Notificações</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Lista de notificações */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-indigo-600">Prazo próximo</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Audiência do processo #12345 em 2 dias
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Há 1 hora</p>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-green-600">Pagamento confirmado</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Sua assinatura foi renovada com sucesso
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Há 3 horas</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-blue-600">Novo documento</p>
                      <p className="text-sm text-gray-700 mt-1">
                        Cliente João Silva enviou um novo documento
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Ontem</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200">
                    <a
                      href="#"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Ver todas as notificações
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="ml-4 relative flex-shrink-0">
              <div>
                <button
                  type="button"
                  className="bg-white rounded-full flex focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  id="user-menu"
                  aria-expanded="false"
                  aria-haspopup="true"
                  onClick={toggleProfileMenu}
                >
                  <span className="sr-only">Abrir menu do usuário</span>
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="h-5 w-5 text-gray-400 ml-1" />
                </button>
              </div>

              {/* Dropdown do perfil */}
              {isProfileMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Seu Perfil
                  </a>
                  <a
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Configurações
                  </a>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
