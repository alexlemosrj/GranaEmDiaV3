import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables.');
}

// Create Supabase client with proper configuration for multi-user support
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // Armazenar sessão no localStorage para persistência
      storage: window.localStorage,
      // Auto-refresh de token habilitado
      autoRefreshToken: true,
      // Persistir sessão entre reloads
      persistSession: true,
      // Detectar mudanças de sessão em outras abas
      detectSessionInUrl: true,
    },
    // Configurações de realtime
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Types for the database
export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string;
          user_id: string;
          description: string;
          amount: number;
          category: 'Moradia' | 'Mercado' | 'Outros' | 'Freelance';
          type: 'income' | 'expense';
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          description: string;
          amount: number;
          category: 'Moradia' | 'Mercado' | 'Outros' | 'Freelance';
          type: 'income' | 'expense';
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          description?: string;
          amount?: number;
          category?: 'Moradia' | 'Mercado' | 'Outros' | 'Freelance';
          type?: 'income' | 'expense';
          date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          deadline: string;
          recurring: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          deadline: string;
          recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          target_amount?: number;
          current_amount?: number;
          deadline?: string;
          recurring?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          title: string;
          description: string;
          type: 'payment' | 'goal' | 'reminder';
          amount: number | null;
          time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          title: string;
          description: string;
          type: 'payment' | 'goal' | 'reminder';
          amount?: number | null;
          time: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          title?: string;
          description?: string;
          type?: 'payment' | 'goal' | 'reminder';
          amount?: number | null;
          time?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          avatar: string;
          whatsapp: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          avatar?: string;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          avatar?: string;
          whatsapp?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}