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
import AuthCallback from '@/pages/auth/callback';
import ResetPassword from '@/pages/auth/reset-password';
import { useFinanceStore } from "./store/useFinanceStore";
import { supabase } from "./lib/supabase";
import { GoalToastProvider } from '@/components/GoalToastProvider';

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
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let mounted = true;
    
    // Set a hard timeout to ensure loading never gets stuck
    const hardTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Hard timeout reached - forcing loading to complete');
        setLoading(false);
        setInitialCheckDone(true);
      }
    }, 3000); // 3 seconds hard limit

    const getSession = async () => {
      console.log('Starting session check...');
      
      try {
        if (isSupabaseConfigured) {
          console.log('Checking Supabase session...');
          
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            if (mounted) {
              setLoading(false);
              setInitialCheckDone(true);
            }
            return;
          }
          
          console.log('Session check complete:', session ? 'Session found' : 'No session');
          
          if (mounted) {
            setSession(session);
            setInitialCheckDone(true);
          }
          
          // Sync in background - don't block loading
          if (session?.user && mounted) {
            console.log('Starting background sync...');
            syncWithSupabase().catch(err => {
              console.error('Background sync error:', err);
            });
          }
        } else {
          console.log('Supabase not configured, checking demo mode...');
          // Modo offline
          const demoAuth = localStorage.getItem('demoAuth') === 'true';
          if (demoAuth && mounted) {
            setSession({ user: { id: 'demo-user', email: 'demo@local' } } as any);
            syncWithSupabase().catch(err => {
              console.error('Demo sync error:', err);
            });
          }
          if (mounted) {
            setInitialCheckDone(true);
          }
        }
      } catch (error) {
        console.error('Error in session initialization:', error);
      } finally {
        if (mounted) {
          console.log('Session check finished, setting loading to false');
          setLoading(false);
        }
      }
    };

    getSession();

    // Only attach supabase auth listener when supabase is configured
    let unsubscribe: (() => void) | undefined;
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (!mounted) return;
          
          setSession(session);
          
          // ✅ ISTO VAI CAPTURAR O CALLBACK
          if (event === 'SIGNED_IN' && session?.user) {
            console.log(`User authenticated: ${session.user.id}`);
            syncWithSupabase().catch(err => {
              console.error('Sync error after login:', err);
            });
          }
          
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, clearing data...');
            setCurrentUserId(null);
            clearStore();
          }
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    }

    // Listen for demo authentication events from Login (offline mode)
    const onDemoAuthenticated = async () => {
      if (!mounted) return;
      setSession({ user: { id: 'demo-user', email: 'demo@local' } } as any);
      syncWithSupabase().catch(err => {
        console.error('Demo auth sync error:', err);
      });
    };
    
    const onDemoLogout = () => {
      if (!mounted) return;
      localStorage.removeItem('demoAuth');
      setSession(null);
      setCurrentUserId(null);
      clearStore();
    };

    window.addEventListener('demo-authenticated', onDemoAuthenticated);
    window.addEventListener('demo-logout', onDemoLogout);

    return () => {
      mounted = false;
      clearTimeout(hardTimeout);
      if (unsubscribe) unsubscribe();
      window.removeEventListener('demo-authenticated', onDemoAuthenticated);
      window.removeEventListener('demo-logout', onDemoLogout);
    };
  }, []);

  // Show loading only briefly and only if initial check isn't done
  if (loading && !initialCheckDone) {
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
        <GoalToastProvider />
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
              
              {/* Auth routes */}
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              
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