import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Target, 
  Calendar, 
  FileText, 
  Bell, 
  User,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
  Mic,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileModal from './UserProfileModal';
import NewTransactionModal from './NewTransactionModal';
import { useIsMobile } from '../hooks/use-mobile';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { useFinanceStore } from '../store/useFinanceStore';

interface Profile {
  name: string;
  avatar: string;
}

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const { currentUserId } = useFinanceStore();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile>({ name: 'Usuário', avatar: '🔥' });

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', color: 'text-blue-400 hover:bg-blue-900/20' },
    { path: '/transacoes', icon: CreditCard, label: 'Transações', color: 'text-emerald-400 hover:bg-emerald-900/20' },
    { path: '/metas', icon: Target, label: 'Metas', color: 'text-orange-400 hover:bg-orange-900/20' },
    { path: '/agenda', icon: Calendar, label: 'Agenda', color: 'text-purple-400 hover:bg-purple-900/20' },
    { path: '/relatorios', icon: FileText, label: 'Relatórios', color: 'text-cyan-400 hover:bg-cyan-900/20' },
    { path: '/voz', icon: Mic, label: 'Agente Voz', color: 'text-pink-400 hover:bg-pink-900/20' }
  ];

  const sidebarWidth = sidebarOpen || sidebarHovered ? 'w-64' : 'w-16';
  const showLabels = sidebarOpen || sidebarHovered;

  useEffect(() => {
    loadProfile();
  }, [currentUserId]); // Recarregar perfil quando o usuário mudar

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile({ name: data.name, avatar: data.avatar });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <>
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-teal-50'
      }`}>
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{ 
            width: isMobile ? (sidebarOpen ? 256 : 0) : (sidebarOpen || sidebarHovered ? 256 : 64),
            x: isMobile && !sidebarOpen ? -256 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onMouseEnter={() => !isMobile && setSidebarHovered(true)}
          onMouseLeave={() => !isMobile && setSidebarHovered(false)}
          className={`fixed left-0 top-0 h-full z-40 overflow-hidden transition-colors duration-300 ${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white border-r border-teal-200'
          } ${isMobile ? 'shadow-2xl' : ''}`}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <AnimatePresence>
                {showLabels ? (
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`text-xl font-bold whitespace-nowrap ${
                      theme === 'dark' ? 'text-emerald-400' : 'text-teal-600'
                    }`}
                  >
                    $ Grana em Dia
                  </motion.h1>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      theme === 'dark' ? 'bg-emerald-500/20' : 'bg-teal-100'
                    }`}
                  >
                    <DollarSign className={`${
                      theme === 'dark' ? 'text-emerald-400' : 'text-teal-600'
                    }`} size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`p-2 rounded-lg transition-colors lg:hidden ${
                    theme === 'dark' 
                      ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-teal-100'
                  }`}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? theme === 'dark'
                          ? 'bg-violet-500 text-white' 
                          : 'bg-teal-500 text-white'
                        : theme === 'dark'
                          ? `text-gray-300 hover:text-white ${item.color}`
                          : `text-gray-600 hover:text-gray-900 ${item.color.replace('text-', 'hover:text-').replace('hover:bg-', 'hover:bg-')}`
                    } ${!showLabels ? 'justify-center' : ''}`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <AnimatePresence>
                      {showLabels && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.div>

        {/* Header */}
        <div className={`fixed top-0 right-0 h-16 z-30 transition-all duration-300 border-b ${
          theme === 'dark' 
            ? 'bg-slate-900 border-slate-700' 
            : 'bg-white border-teal-200'
        } ${isMobile ? 'left-0' : (sidebarOpen || sidebarHovered ? 'left-64' : 'left-16')}`}>
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
              {/* Hamburger Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-teal-100'
                }`}
              >
                <Menu size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Nova Transação - só aparece no dashboard */}
              {isDashboard && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNewTransactionModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Nova Transação</span>
                </motion.button>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-teal-100'
                }`}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Bell className={`cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`} size={20} />
              
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-slate-700' 
                    : 'hover:bg-teal-100'
                }`}
              >
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-lg overflow-hidden">
                  {profile.avatar.startsWith('data:') ? (
                    <img 
                      src={profile.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{profile.avatar}</span>
                  )}
                </div>
                <span className={`text-sm hidden sm:block ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {profile.name}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 pt-16 ${
          isMobile ? 'ml-0' : (sidebarOpen || sidebarHovered ? 'ml-64' : 'ml-16')
        }`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-6"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          loadProfile();
        }}
      />

      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
      />
    </>
  );
};

export default Layout;