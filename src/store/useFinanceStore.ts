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

// Mock data for offline mode
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

// Check if Supabase is configured
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY && 
                             SUPABASE_URL.includes('supabase.co') && 
                             SUPABASE_ANON_KEY.length > 50;

// Helper: generate a simple unique id for offline items
function genId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentUserId: (userId: string | null) => {
        const currentUserId = get().currentUserId;
        
        // Se o usuário mudou, limpar os dados do usuário anterior
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
        if (!isSupabaseConfigured) {
          // No subscriptions in offline/dev mode
          return;
        }

        const setupSubscriptions = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('Nenhum usuário autenticado, não configurando subscriptions.');
            return;
          }

          // Limpar subscriptions existentes ANTES de criar novas
          console.log('Limpando subscriptions antigas...');
          get().cleanupSubscriptions();

          console.log(`Criando novas subscriptions para usuário: ${user.id}`);

          // Subscription para transações
          const transactionsSubscription = supabase
            .channel(`transactions-${user.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
              (payload) => {
                console.log('Mudança em transações detectada:', payload);
                get().loadTransactions();
              }
            )
            .subscribe();

          // Subscription para metas
          const goalsSubscription = supabase
            .channel(`goals-${user.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` },
              (payload) => {
                console.log('Mudança em metas detectada:', payload);
                get().loadGoals();
              }
            )
            .subscribe();

          // Subscription para eventos
          const eventsSubscription = supabase
            .channel(`events-${user.id}`)
            .on('postgres_changes', 
              { event: '*', schema: 'public', table: 'events', filter: `user_id=eq.${user.id}` },
              (payload) => {
                console.log('Mudança em eventos detectada:', payload);
                get().loadEvents();
              }
            )
            .subscribe();

          subscriptions = [transactionsSubscription, goalsSubscription, eventsSubscription];
          console.log(`${subscriptions.length} subscriptions criadas com sucesso.`);
        };

        setupSubscriptions();
      },

      cleanupSubscriptions: () => {
        if (subscriptions.length > 0) {
          console.log(`Limpando ${subscriptions.length} subscription(s)...`);
          subscriptions.forEach(subscription => {
            supabase.removeChannel(subscription);
          });
          subscriptions = [];
          console.log('Subscriptions limpas com sucesso.');
        }
      },

      addTransaction: async (transaction) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: add locally
            const newTx: Transaction = {
              id: genId(),
              ...transaction
            };
            set((state) => ({
              transactions: [newTx, ...state.transactions],
              balance: state.balance + transaction.amount,
            }));
            get().calculateMonthlyStats();
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { data, error } = await supabase
            .from('transactions')
            .insert({ 
              ...transaction, 
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          // Recalcular estatísticas mensais
          get().calculateMonthlyStats();

        } catch (error: any) {
          console.error('Erro ao adicionar transação:', error);
          set({ isLoading: false, error: error.message || 'Falha ao adicionar transação.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateTransaction: async (id, updatedTransaction) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: update locally and adjust balance
            set((state) => {
              const prev = state.transactions.find(t => t.id === id);
              const transactions = state.transactions.map((t) => 
                t.id === id ? { ...t, ...updatedTransaction } : t
              );
              let balance = state.balance;
              if (prev) {
                const newAmount = updatedTransaction.amount !== undefined ? updatedTransaction.amount : prev.amount;
                balance = state.balance - prev.amount + newAmount;
              }
              return { transactions, balance };
            });
            get().calculateMonthlyStats();
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { error } = await supabase
            .from('transactions')
            .update({ 
              ...updatedTransaction,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          get().calculateMonthlyStats();

        } catch (error: any) {
          console.error('Erro ao atualizar transação:', error);
          set({ isLoading: false, error: error.message || 'Falha ao atualizar transação.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: delete locally and adjust balance
            set((state) => {
              const txn = state.transactions.find(t => t.id === id);
              const transactions = state.transactions.filter((t) => t.id !== id);
              const balance = txn ? state.balance - txn.amount : state.balance;
              return { transactions, balance };
            });
            get().calculateMonthlyStats();
            return;
          }
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          get().calculateMonthlyStats();

        } catch (error: any) {
          console.error('Erro ao deletar transação:', error);
          set({ isLoading: false, error: error.message || 'Falha ao deletar transação.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      addGoal: async (goal) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: add locally
            const newGoal: Goal = { id: genId(), ...goal };
            set((state) => ({ goals: [newGoal, ...state.goals] }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const goalDataForSupabase = {
            user_id: user.id,
            name: goal.name,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            deadline: goal.deadline,
            recurring: goal.recurring,
          };

          const { data: newGoal, error } = await supabase
            .from('goals')
            .insert(goalDataForSupabase)
            .select()
            .single();

          if (error) throw error;
          if (!newGoal) throw new Error("Falha ao obter a meta criada.");

          // Recarregar metas para atualizar a UI
          await get().loadGoals();

          // Criar evento correspondente na agenda
          await get().addEvent({
            date: newGoal.deadline,
            title: `Prazo final: ${newGoal.name}`,
            description: `Data limite para a meta \"${newGoal.name}\".`,
            type: 'goal',
            time: '09:00' // Horário padrão para eventos de meta
          });

        } catch (error: any) {
          console.error('Erro ao adicionar meta:', error);
          set({ isLoading: false, error: error.message || 'Falha ao adicionar meta.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateGoal: async (id, updatedGoal) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: update locally
            set((state) => {
              const goals = state.goals.map((g) => 
                g.id === id ? { ...g, ...updatedGoal } : g
              );
              return { goals };
            });
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const updateData: any = { 
            ...updatedGoal,
            updated_at: new Date().toISOString()
          };

          if (updatedGoal.targetAmount !== undefined) {
            updateData.target_amount = updatedGoal.targetAmount;
          }
          if (updatedGoal.currentAmount !== undefined) {
            updateData.current_amount = updatedGoal.currentAmount;
          }

          const { error } = await supabase
            .from('goals')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          // Recarregar as metas para atualizar a visualização
          await get().loadGoals();

        } catch (error: any) {
          console.error('Erro ao atualizar meta:', error);
          set({ isLoading: false, error: error.message || 'Falha ao atualizar meta.' });
        } finally {
          set({ isLoading: false });
        }
      },
      
      deleteGoal: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: remove locally
            set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
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

          // Recarregar as metas para atualizar a visualização
          await get().loadGoals();

        } catch (error: any) {
          console.error('Erro ao deletar meta:', error);
          set({ isLoading: false, error: error.message || 'Falha ao deletar meta.' });
        } finally {
          set({ isLoading: false });
        }
      },

      addEvent: async (event) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: add locally
            const newEvent: Event = { id: genId(), ...event };
            set((state) => ({ events: [newEvent, ...state.events] }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { error } = await supabase
            .from('events')
            .insert({ ...event, user_id: user.id });

          if (error) throw error;

          // Fetch events again to update the state
          await get().loadEvents();

        } catch (error: any) {
          console.error('Erro ao adicionar evento:', error);
          set({ isLoading: false, error: error.message || 'Falha ao adicionar evento.' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateEvent: async (id, updatedEvent) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: update locally
            set((state) => {
              const events = state.events.map((e) => e.id === id ? { ...e, ...updatedEvent } : e);
              return { events };
            });
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { error } = await supabase
            .from('events')
            .update({ 
              ...updatedEvent,
              updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

        } catch (error: any) {
          console.error('Erro ao atualizar evento:', error);
          set({ isLoading: false, error: error.message || 'Falha ao atualizar evento.' });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteEvent: async (id) => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: delete locally
            set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
            return;
          }

          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("Usuário não autenticado");

          const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

        } catch (error: any) {
          console.error('Erro ao deletar evento:', error);
          set({ isLoading: false, error: error.message || 'Falha ao deletar evento.' });
        } finally {
          set({ isLoading: false });
        }
      },

      loadTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          if (!isSupabaseConfigured) {
            // Offline: use persisted or mock transactions
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
          
          set({ 
            transactions, 
            balance, 
            isLoading: false 
          });

          get().calculateMonthlyStats();

        } catch (error: any) {
          console.error('Erro ao carregar transações:', error);
          set({ isLoading: false, error: error.message || 'Erro ao carregar dados do servidor.' });
        } finally {
          set({ isLoading: false });
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
          console.error('Erro ao carregar metas:', error);
          set({ isLoading: false, error: error.message || 'Erro ao carregar dados do servidor.' });
        } finally {
          set({ isLoading: false });
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
            .order('date', { ascending: false })
            .order('time', { ascending: false });

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
          console.error('Erro ao carregar eventos:', error);
          set({ isLoading: false, error: error.message || 'Erro ao carregar dados do servidor.' });
        } finally {
          set({ isLoading: false });
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
        console.log("Iniciando sincronização com Supabase...");
        
        // Obter usuário atual e configurar userId
        if (isSupabaseConfigured) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log(`Sincronizando dados do usuário: ${user.id}`);
            setCurrentUserId(user.id);
          } else {
            console.log("Nenhum usuário autenticado para sincronizar.");
            return;
          }
        } else {
          // Modo demo
          setCurrentUserId('demo-user');
        }
        
        console.log("Carregando transações...");
        await loadTransactions();
        console.log("Transações carregadas.");
        
        console.log("Carregando metas...");
        await loadGoals();
        console.log("Metas carregadas.");
        
        console.log("Carregando eventos...");
        await loadEvents();
        console.log("Eventos carregados.");
        
        console.log("Configurando subscriptions...");
        setupRealtimeSubscriptions();
        console.log("Sincronização com Supabase concluída.");
      }
    }),
    {
      name: 'finance-storage',
      partialize: (state) => ({
        // Armazenar apenas os dados essenciais, associados ao usuário
        transactions: state.transactions,
        goals: state.goals,
        events: state.events,
        balance: state.balance,
        monthlyIncome: state.monthlyIncome,
        monthlyExpenses: state.monthlyExpenses,
        currentUserId: state.currentUserId,
      }),
      // Usar merge personalizado para evitar conflitos entre usuários
      merge: (persistedState: any, currentState) => {
        // Se houver um usuário persistido e ele for diferente do atual, ignorar dados persistidos
        const storedUserId = persistedState?.currentUserId;
        const currentUserId = currentState.currentUserId;
        
        if (storedUserId && currentUserId && storedUserId !== currentUserId) {
          console.log('Usuário diferente detectado no storage, usando estado limpo.');
          return currentState;
        }
        
        return {
          ...currentState,
          ...persistedState,
        };
      },
    }
  )
);