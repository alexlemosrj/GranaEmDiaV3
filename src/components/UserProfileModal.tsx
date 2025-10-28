import React, { useState, useEffect } from 'react';
import { X, Camera, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-hot-toast';
import { useFinanceStore } from '../store/useFinanceStore';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Profile {
  id: string;
  name: string;
  avatar: string;
  whatsapp: string | null;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const clearStore = useFinanceStore(state => state.clearStore);

  const emojiAvatars = [
    '👤', '😊', '😎', '🤓', '👨‍💼', '👩‍💼', '🎯', '🚀',
    '🔥', '⚡', '💼', '🏆', '💰', '🎨', '⭐', '🎭'
  ];

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co') && 
                                   import.meta.env.VITE_SUPABASE_ANON_KEY?.length > 50;

      if (!isSupabaseConfigured) {
        setProfile({
          id: 'demo-user',
          name: 'Usuário Demo',
          avatar: '🔥',
          whatsapp: null
        });
        setUserEmail('demo@exemplo.com');
        setMemberSince(new Date().toLocaleDateString('pt-BR'));
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || '');
      setMemberSince(new Date(user.created_at).toLocaleDateString('pt-BR'));

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        setProfile(data);
      } else {
        const newProfile = {
          user_id: user.id,
          name: user.user_metadata?.name || 'Usuário',
          avatar: '🔥',
          whatsapp: null
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
        } else {
          setProfile(createdProfile);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co') && 
                                   import.meta.env.VITE_SUPABASE_ANON_KEY?.length > 50;

      if (!isSupabaseConfigured) {
        toast.success('Perfil atualizado com sucesso! (Modo desenvolvimento)');
        onClose();
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          avatar: profile.avatar,
          whatsapp: profile.whatsapp,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil: ' + (error?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co') && 
                                   import.meta.env.VITE_SUPABASE_ANON_KEY?.length > 50;

      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }

      // Clear local persisted finance store
      clearStore();
      
      // Clear demo auth flag and notify app (for offline/demo mode)
      localStorage.removeItem('demoAuth');
      window.dispatchEvent(new CustomEvent('demo-logout'));

      // Close modal and navigate to login page
      onClose();
      navigate('/login');
      
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 2MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile(prev => prev ? { ...prev, avatar: result } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`relative rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50' 
                : 'bg-gradient-to-br from-white to-teal-50 border-teal-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Perfil do Usuário
              </h2>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'text-gray-400 hover:text-white hover:bg-slate-700/50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-teal-100'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 bg-teal-600 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto overflow-hidden">
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
                <label className={`absolute -bottom-2 -right-2 p-2 rounded-full cursor-pointer transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-700 hover:bg-slate-600' 
                    : 'bg-teal-100 hover:bg-teal-200'
                }`}>
                  <Camera size={16} className={theme === 'dark' ? 'text-white' : 'text-teal-700'} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Escolha seu avatar ou faça upload de uma foto
              </p>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-8 gap-2">
                {emojiAvatars.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setProfile(prev => prev ? { ...prev, avatar: emoji } : null)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-200 ${
                      profile.avatar === emoji
                        ? 'bg-teal-600 scale-110'
                        : theme === 'dark'
                          ? 'bg-slate-700 hover:bg-slate-600'
                          : 'bg-teal-100 hover:bg-teal-200'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nome
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700/50 border-slate-600/50 text-white focus:border-teal-500 focus:ring-teal-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  WhatsApp (opcional)
                </label>
                <input
                  type="text"
                  value={profile.whatsapp || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, whatsapp: e.target.value || null } : null)}
                  placeholder="(11) 99999-9999"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 focus:border-teal-500 focus:ring-teal-500/20' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-teal-500 focus:ring-teal-500/20'
                  }`}
                />
              </div>

              <div className={`text-sm space-y-1 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <p><span className="font-medium">Email:</span> {userEmail}</p>
                <p><span className="font-medium">Membro desde:</span> {memberSince}</p>
                <p><span className="font-medium">Assinatura:</span> Básico</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-teal-500/25 disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className={`w-full px-4 py-3 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400'
                    : 'bg-red-50 hover:bg-red-100 border border-red-200 text-red-600'
                }`}
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserProfileModal;