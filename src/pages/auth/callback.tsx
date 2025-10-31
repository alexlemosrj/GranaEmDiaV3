import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 AuthCallback: Verificando sessão...');

        // Supabase detecta automaticamente a sessão da URL (#access_token=...)
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Auth callback error:', error);
          toast.error('Erro ao confirmar email');
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          console.log('✅ Email confirmado! Usuário:', session.user.email);
          toast.success('Email confirmado com sucesso!');
          navigate('/', { replace: true });
        } else {
          console.log('⚠️ Nenhuma sessão detectada');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('❌ Callback error:', err);
        toast.error('Erro no processamento');
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1a1f2e]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3d8a7d] mx-auto mb-4"></div>
        <p className="text-gray-400">Confirmando seu email...</p>
      </div>
    </div>
  );
}