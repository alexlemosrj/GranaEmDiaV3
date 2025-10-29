import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: 'Moradia' | 'Mercado' | 'Outros' | 'Freelance';
  type: 'income' | 'expense';
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  recurring: boolean;
}

export interface Event {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'payment' | 'goal' | 'reminder';
  amount?: number | null;
  time: string;
}

export interface FinanceState {
  balance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactions: Transaction[];
  goals: Goal[];
  events: Event[];
  isLoading: boolean;
  error: string | null;
  currentUserId: string | null;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  
  syncWithSupabase: () => Promise<void>;
  loadTransactions: () => Promise<void>;
  loadGoals: () => Promise<void>;
  loadEvents: () => Promise<void>;
  calculateMonthlyStats: () => void;
  clearStore: () => void;
  setupRealtimeSubscriptions: () => void;
  cleanupSubscriptions: () => void;
  setCurrentUserId: (userId: string | null) => void;
}

const mockTransactions: Transaction[] = [
  { id: '1', description: 'Compra no Mercado', amount: -130, category: 'Mercado', type: 'expense', date: '2025-10-10' },
  { id: '2', description: 'Freelance', amount: 500, category: 'Freelance', type: 'income', date: '2025-10-10' },
  { id: '3', description: 'Aluguel', amount: -800, category: 'Moradia', type: 'expense', date: '2025-10-05' },
  { id: '4', description: 'Salário', amount: 3000, category: 'Freelance', type: 'income', date: '2025-10-01' }
];

const mockGoals: Goal[] = [
  { id: '1', name: 'TV 65 pol', targetAmount: 3500, currentAmount: 650, deadline: '2025-10-29', recurring: false },
  { id: '2', name: 'PC Gamer', targetAmount: 7500, currentAmount: 50, deadline: '2025-10-29', recurring: false }
];

const mockEvents: Event[] = [
  {
    id: '1',
    date: '2025-10-13',
    title: 'Pagamento Moradia',
    description: 'Aluguel mensal',
    type: 'payment',
    amount: 800,
    time: '09:00'
  },
  {
    id: '2',
    date: '2025-10-15',
    title: 'Meta TV 65pol',
    description: 'Milestone da meta',
    type: 'goal',
    amount: null,
    time: '10:00'
  },
  {
    id: '3',
    date: '2025-10-20',
    title: 'Freelance',
    description: 'Recebimento do projeto',
    type: 'payment',
    amount: 500,
    time: '14:00'
  },
  {
    id: '4',
    date: '2025-10-25',
    title: 'Compra Mercado',
    description: 'Compras mensais',
    type: 'payment',
    amount: 150,
    time: '16:00'
  }
];

const initialState = {
  balance: 0,
  monthlyIncome: 0,
  monthlyExpenses: 0,
  transactions: [],
  goals: [],
  events: [],
  isLoading: false,
  error: null,
  currentUserId: null,
};

let subscriptions: any[] = [];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && 
                             SUPABASE_URL.includes('supabase.co') && 
                             SUPABASE_ANON_KEY.length > 50;

function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentUserId: (userId: string | null) => {
        const currentUserId = get().currentUserId;
        
        if (currentUserId && userId && currentUserId !== userId) {
          console.log('Mudança de usuário detectada, limpando dados do usuário anterior...');
          get().cleanupSubscriptions();
          set({
            ...initialState,
            currentUserId: userId,
          });
        } else {
          set({ currentUserId: userId });
        }
      },
      
      clearStore: () => {
        get().cleanupSubscriptions();
        set(initialState);
      },

      setupRealtimeSubscriptions: () => {
        if (!isSupabaseConfigured) return;

        const setupSubscriptions = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          get().cleanupSubscriptions();

          const transactionsSubscription = supabase
            .channel(`transactions-${user.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
              () => get().loadTransactions()
            )
            .subscribe();

          const goalsSubscription = supabase
            .channel(`goals-${user.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` },
              () => get().loadGoals()
            )
            .subscribe();

          const eventsSubscription = supabase
            .channel(`events-${user.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
              () => get().loadEvents()
            )
            .subscribe();

          subscriptions = [transactionsSubscription, goalsSubscription, eventsSubscription];
        };

        setupSubscriptions();
      },

      cleanupSubscriptions: () => {
        subscriptions.forEach(subscription => {
          supabase.removeChannel(subscription);
        });
        subscriptions = [];
      },

      addTransaction: async (transaction) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            const newTx: Transaction = { id: genId(), ...transaction };
            set((state) => ({
              transactions: [newTx, ...state.transactions],
              balance: state.balance + transaction.amount,
            }));
            get().calculateMonthlyStats();
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          await supabase
            .from('transactions')
            .insert({ 
              ...transaction, 
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          get().calculateMonthlyStats();
        } catch (error: any) {
          set({ error: error.message || 'Falha ao adicionar transação.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateTransaction: async (id, updatedTransaction) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => {
              const prev = state.transactions.find(t => t.id === id);
              const transactions = state.transactions.map((t) => 
                t.id === id ? { ...t, ...updatedTransaction } : t
              );
              let balance = state.balance;
              if (prev && updatedTransaction.amount !== undefined) {
                balance = state.balance - prev.amount + updatedTransaction.amount;
              }
              return { transactions, balance };
            });
            get().calculateMonthlyStats();
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          await supabase
            .from('transactions')
            .update({ 
              ...updatedTransaction,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id);

          get().calculateMonthlyStats();
        } catch (error: any) {
          set({ error: error.message || 'Falha ao atualizar transação.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => {
              const txn = state.transactions.find(t => t.id === id);
              return {
                transactions: state.transactions.filter((t) => t.id !== id),
                balance: txn ? state.balance - txn.amount : state.balance,
              };
            });
            get().calculateMonthlyStats();
            return;
          }
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          get().calculateMonthlyStats();
        } catch (error: any) {
          set({ error: error.message || 'Falha ao deletar transação.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      addGoal: async (goal) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => ({ goals: [{ id: genId(), ...goal }, ...state.goals] }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { data: newGoal, error } = await supabase
            .from('goals')
            .insert({
              user_id: user.id,
              name: goal.name,
              target_amount: goal.targetAmount,
              current_amount: goal.currentAmount,
              deadline: goal.deadline,
              recurring: goal.recurring,
            })
            .select()
            .single();

          if (error) throw error;

          await get().loadGoals();

          if (newGoal) {
            await get().addEvent({
              date: newGoal.deadline,
              title: `Prazo final: ${newGoal.name}`,
              description: `Data limite para a meta "${newGoal.name}".`,
              type: 'goal',
              time: '09:00'
            });
          }
        } catch (error: any) {
          set({ error: error.message || 'Falha ao adicionar meta.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateGoal: async (id, updatedGoal) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => ({
              goals: state.goals.map((g) => 
                g.id === id ? { ...g, ...updatedGoal } : g
              ),
            }));
            window.dispatchEvent(new CustomEvent('goalUpdated', { 
              detail: { success: true, message: 'Meta atualizada com sucesso!' } 
            }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const updateData: any = { updated_at: new Date().toISOString() };

          if (updatedGoal.name !== undefined) updateData.name = updatedGoal.name;
          if (updatedGoal.targetAmount !== undefined) updateData.target_amount = updatedGoal.targetAmount;
          if (updatedGoal.currentAmount !== undefined) updateData.current_amount = updatedGoal.currentAmount;
          if (updatedGoal.deadline !== undefined) updateData.deadline = updatedGoal.deadline;
          if (updatedGoal.recurring !== undefined) updateData.recurring = updatedGoal.recurring;

          const { error } = await supabase
            .from('goals')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set({ isLoading: false, error: null });
          await get().loadGoals();

          window.dispatchEvent(new CustomEvent('goalUpdated', { 
            detail: { success: true, message: 'Meta atualizada com sucesso! ✅' } 
          }));

        } catch (error: any) {
          const errorMsg = error.message || 'Falha ao atualizar meta.';
          set({ isLoading: false, error: errorMsg });
          
          window.dispatchEvent(new CustomEvent('goalUpdated', { 
            detail: { success: false, message: `Erro: ${errorMsg}` } 
          }));
          throw error;
        }
      },
      
      deleteGoal: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
            window.dispatchEvent(new CustomEvent('goalUpdated', { 
              detail: { success: true, message: 'Meta cancelada com sucesso!' } 
            }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set({ isLoading: false, error: null });
          await get().loadGoals();

          window.dispatchEvent(new CustomEvent('goalUpdated', { 
            detail: { success: true, message: 'Meta cancelada com sucesso! 🗑️' } 
          }));

        } catch (error: any) {
          const errorMsg = error.message || 'Falha ao deletar meta.';
          set({ isLoading: false, error: errorMsg });
          
          window.dispatchEvent(new CustomEvent('goalUpdated', { 
            detail: { success: false, message: `Erro ao cancelar: ${errorMsg}` } 
          }));
          throw error;
        }
      },

      addEvent: async (event) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => ({ events: [{ id: genId(), ...event }, ...state.events] }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          await supabase
            .from('events')
            .insert({ ...event, user_id: user.id });

          await get().loadEvents();
        } catch (error: any) {
          set({ error: error.message || 'Falha ao adicionar evento.' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateEvent: async (id, updatedEvent) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => ({
              events: state.events.map((e) => e.id === id ? { ...e, ...updatedEvent } : e),
            }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          await supabase
            .from('events')
            .update({ ...updatedEvent, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id);
        } catch (error: any) {
          set({ error: error.message || 'Falha ao atualizar evento.' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          await supabase
            .from('events')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);
        } catch (error: any) {
          set({ error: error.message || 'Falha ao deletar evento.' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            const transactions = get().transactions.length ? get().transactions : mockTransactions;
            const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
            set({ transactions, balance, isLoading: false });
            get().calculateMonthlyStats();
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) throw error;

          const transactions: Transaction[] = data.map(t => ({
            id: t.id,
            description: t.description,
            amount: parseFloat(t.amount),
            category: t.category,
            type: t.type,
            date: t.date
          }));

          const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
          set({ transactions, balance, isLoading: false });
          get().calculateMonthlyStats();
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Erro ao carregar transações.' });
        }
      },

      loadGoals: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            const goals = get().goals.length ? get().goals : mockGoals;
            set({ goals, isLoading: false });
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const goals: Goal[] = data.map(g => ({
            id: g.id,
            name: g.name,
            targetAmount: parseFloat(g.target_amount),
            currentAmount: parseFloat(g.current_amount),
            deadline: g.deadline,
            recurring: g.recurring
          }));

          set({ goals, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Erro ao carregar metas.' });
        }
      },

      loadEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            const events = get().events.length ? get().events : mockEvents;
            set({ events, isLoading: false });
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });

          if (error) throw error;

          const events: Event[] = data.map(e => ({
            id: e.id,
            date: e.date,
            title: e.title,
            description: e.description,
            type: e.type,
            amount: e.amount,
            time: e.time
          }));

          set({ events, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message || 'Erro ao carregar eventos.' });
        }
      },

      calculateMonthlyStats: () => {
        const { transactions } = get();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        });

        const monthlyIncome = monthlyTransactions
          .filter(t => t.amount > 0)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const monthlyExpenses = Math.abs(monthlyTransactions
          .filter(t => t.amount < 0)
          .reduce((sum, t) => sum + t.amount, 0));

        set({ monthlyIncome, monthlyExpenses });
      },

      syncWithSupabase: async () => {
        const { loadTransactions, loadGoals, loadEvents, setupRealtimeSubscriptions, setCurrentUserId } = get();
        
        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          setCurrentUserId(user?.id || null);
        } else {
          setCurrentUserId('demo-user');
        }
        
        await loadTransactions();
        await loadGoals();
        await loadEvents();
        setupRealtimeSubscriptions();
      }
    }),
    {
      name: 'finance-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        goals: state.goals,
        events: state.events,
        balance: state.balance,
        monthlyIncome: state.monthlyIncome,
        monthlyExpenses: state.monthlyExpenses,
        currentUserId: state.currentUserId,
      }),
      merge: (persistedState: any, currentState) => {
        const storedUserId = persistedState?.currentUserId;
        const currentUserId = currentState.currentUserId;
        
        if (storedUserId && currentUserId && storedUserId !== currentUserId) {
          return currentState;
        }
        
        return { ...currentState, ...persistedState };
      },
    }
  )
);