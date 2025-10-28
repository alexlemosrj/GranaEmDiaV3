import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Metas from "./pages/Metas";
import Agenda from "./pages/Agenda";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
import VoiceAgent from "./pages/VoiceAgent";
import Login from "./pages/Login";
import { useFinanceStore } from "./store/useFinanceStore";
import { supabase } from "./lib/supabase";

const queryClient = new QueryClient();

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && 
                             SUPABASE_URL.includes('supabase.co') && 
                             SUPABASE_ANON_KEY.length > 50;

console.log(`App running in ${import.meta.env.MODE} mode`);
console.log(`Supabase configured: ${isSupabaseConfigured}`);

const App = () => {
  const { syncWithSupabase, clearStore, setCurrentUserId } = useFinanceStore();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Erro ao obter sessão:', error);
          }
          setSession(session);
          if (session?.user) {
            await syncWithSupabase();
          }
        } else {
          // Modo offline: don't auto-create a session.
          // Instead, check if user explicitly authenticated in demo mode previously.
          const demoAuth = localStorage.getItem('demoAuth') === 'true';
          if (demoAuth) {
            // Create a minimal demo session object
            setSession({ user: { id: 'demo-user', email: 'demo@local' } } as any);
            // syncWithSupabase is safe because the store checks isSupabaseConfigured internally
            await syncWithSupabase();
          } else {
            console.log('🔧 Modo desenvolvimento ativo — sem sessão automática');
          }
        }
      } catch (error) {
        console.error('Erro na inicialização:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Only attach supabase auth listener when supabase is configured
    let unsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          const previousSession = session;
          setSession(session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log(`Usuário autenticado: ${session.user.id}`);
            // Verificar se é um novo usuário e sincronizar
            await syncWithSupabase();
          }
          
          if (event === 'SIGNED_OUT') {
            console.log('Usuário deslogado, limpando dados...');
            setCurrentUserId(null);
            clearStore();
          }
          
          if (event === 'USER_UPDATED' && session?.user) {
            console.log('Dados do usuário atualizados');
          }
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    }

    // Listen for demo authentication events from Login (offline mode)
    const onDemoAuthenticated = async () => {
      setSession({ user: { id: 'demo-user', email: 'demo@local' } } as any);
      await syncWithSupabase();
    };
    const onDemoLogout = () => {
      localStorage.removeItem('demoAuth');
      setSession(null);
      setCurrentUserId(null);
      clearStore();
    };

    window.addEventListener('demo-authenticated', onDemoAuthenticated);
    window.addEventListener('demo-logout', onDemoLogout);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('demo-authenticated', onDemoAuthenticated);
      window.removeEventListener('demo-logout', onDemoLogout);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
          {!isSupabaseConfigured && (
            <p className="text-gray-400 text-sm mt-2">Modo desenvolvimento ativo</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HotToaster 
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155'
              }
            }}
          />
          <BrowserRouter>
            <Routes>
              {/* Login route - accessible whether logged in or not */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={session ? <Layout /> : <Navigate to="/login" replace />} 
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="transacoes" element={<Transacoes />} />
                <Route path="metas" element={<Metas />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="relatorios" element={<Relatorios />} />
                <Route path="voz" element={<VoiceAgent />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;