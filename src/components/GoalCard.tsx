import React, { useState } from 'react';
import { Goal, useFinanceStore } from '../store/useFinanceStore';
import { Edit3, Calendar, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import EditGoalModal from './EditGoalModal';
import { toast } from 'react-hot-toast';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const { updateGoal, deleteGoal, addTransaction } = useFinanceStore();
  const { theme } = useTheme();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const quickAddAmounts = [50, 100, 200, 500];

  const handleQuickAdd = async (amount: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newCurrentAmount = goal.currentAmount + amount;
      
      // Atualizar a meta
      await updateGoal(goal.id, { currentAmount: newCurrentAmount });
      
      // Adicionar transação para registrar o depósito na meta
      await addTransaction({
        description: `Depósito para meta: ${goal.name}`,
        amount: -amount, // Negativo porque é uma saída de dinheiro para a meta
        category: 'Outros',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });

      toast.success(`R$ ${amount} adicionado à meta ${goal.name}!`);
    } catch (error) {
      console.error('Erro ao adicionar valor à meta:', error);
      toast.error('Erro ao adicionar valor à meta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelGoal = async () => {
    if (isLoading) return;
    
    const confirmCancel = window.confirm(`Tem certeza que deseja cancelar a meta "${goal.name}"?`);
    if (!confirmCancel) return;

    setIsLoading(true);
    try {
      if (goal.currentAmount > 0) {
        // Reembolsar o valor como transação de receita
        await addTransaction({
          description: `Reembolso de Meta: ${goal.name}`,
          amount: goal.currentAmount,
          category: 'Outros',
          type: 'income',
          date: new Date().toISOString().split('T')[0]
        });
      }
      
      await deleteGoal(goal.id);
      toast.success('Meta cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar meta:', error);
      toast.error('Erro ao cancelar meta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-xl p-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-800 border border-slate-700/50' 
            : 'bg-white border border-gray-200'
        }`}
      >
        {/* Header com ícone e botão de editar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Target className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {goal.name}
              </h3>
              <div className={`flex items-center gap-1 text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                <Calendar size={14} />
                <span>Meta: {new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-slate-700/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            } disabled:opacity-50`}
          >
            <Edit3 size={16} />
          </button>
        </div>

        {/* Progresso */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
            }`}>
              Progresso
            </span>
            <span className={`text-sm font-semibold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${
            theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full"
            />
          </div>
        </div>

        {/* Valores */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
            }`}>
              Atual
            </p>
            <p className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
            }`}>
              Meta
            </p>
            <p className={`text-xl font-bold ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Botões de adição rápida */}
        <div className="mb-4">
          <p className={`text-sm mb-3 font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
          }`}>
            Adicionar rapidamente:
          </p>
          <div className="grid grid-cols-4 gap-2">
            {quickAddAmounts.map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAdd(amount)}
                disabled={isLoading}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400'
                    : 'bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-700'
                }`}
              >
                +R$ {amount}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Valor restante */}
        <div className="text-center">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Faltam <span className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span> para atingir a meta
          </p>
        </div>

        {/* Botão cancelar meta */}
        <div className={`mt-4 pt-4 border-t ${
          theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
        }`}>
          <button
            onClick={handleCancelGoal}
            disabled={isLoading}
            className={`w-full text-sm font-medium py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              theme === 'dark'
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
            }`}
          >
            {isLoading ? 'Processando...' : 'Cancelar Meta'}
          </button>
        </div>
      </motion.div>

      <EditGoalModal
        goal={goal}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  );
};

export default GoalCard;