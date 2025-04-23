import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';
import {
  Home,
  Users,
  FileText,
  Folder,
  Calendar,
  CreditCard,
  MessageSquare,
  Settings,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Processos', href: '/processes', icon: FileText },
  { name: 'Documentos', href: '/documents', icon: Folder },
  { name: 'Agenda', href: '/calendar', icon: Calendar },
  { name: 'Pagamentos', href: '/payments', icon: CreditCard },
  { name: 'Assistente IA', href: '/ai-assistant', icon: MessageSquare },
  { name: 'Configurações', href: '/settings', icon: Settings },
  { name: 'Ajuda', href: '/help', icon: HelpCircle },
];

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  return (
    <>
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-indigo-700 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between h-16 px-4 bg-indigo-800">
              <div className="flex items-center">
                <Logo className="text-white" />
              </div>
              <button
                className="text-white focus:outline-none"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <nav className="px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {user && (
              <div className="flex items-center px-4 py-3 bg-indigo-800">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs font-medium text-indigo-200">OAB {user.oabNumber}/{user.oabState}</p>
                </div>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <div className="fixed top-0 left-0 p-4">
            <button
              className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-indigo-700">
            <div className="flex items-center h-16 px-4 bg-indigo-800">
              <Logo className="text-white" />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-indigo-800 text-white'
                          : 'text-indigo-100 hover:bg-indigo-600'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 ${
                          isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            {user && (
              <div className="flex items-center px-4 py-3 bg-indigo-800">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs font-medium text-indigo-200">OAB {user.oabNumber}/{user.oabState}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
