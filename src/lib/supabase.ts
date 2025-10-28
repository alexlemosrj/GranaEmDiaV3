import { supabase } from '../integrations/supabase/client';

export { supabase };

// Re-export types for convenience
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