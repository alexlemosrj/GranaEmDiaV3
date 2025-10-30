import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // ✅ Supabase detecta a sessão da URL automaticamente
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          console.log('✅ Usuário autenticado:', session.user.email);
          navigate('/', { replace: true });
        } else {
          console.log('⚠️ Nenhuma sessão encontrada');
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Callback processing error:', err);
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Autenticando sua conta...</p>
      </div>
    </div>
  );
}