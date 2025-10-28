import React, { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import GoalCard from '../components/GoalCard';
import NewGoalModal from '../components/NewGoalModal';
import { motion } from 'framer-motion';

const Metas = () => {
  const { goals } = useFinanceStore();
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header com título em bloco escuro */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">Metas Financeiras</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNewGoalModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 justify-center sm:justify-start"
            >
              <Target size={18} />
              Nova Meta
            </motion.button>
          </div>
        </div>

        {/* Goals Overview - removido backdrop-blur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-500/20 rounded-full">
              <Target className="text-violet-400" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white">Resumo das Metas</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{goals.length}</p>
              <p className="text-gray-400 text-sm sm:text-base">Metas Ativas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1">
                R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-sm sm:text-base">Total Poupado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-violet-400 mb-1">
                R$ {totalTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-sm sm:text-base">Meta Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                {overallProgress.toFixed(1)}%
              </p>
              <p className="text-gray-400 text-sm sm:text-base">Progresso Geral</p>
            </div>
          </div>

          {/* Barra de progresso geral */}
          {totalTarget > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progresso Geral</span>
                <span className="text-sm font-semibold text-blue-400">{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-violet-500 h-3 rounded-full shadow-lg"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <GoalCard goal={goal} />
              </motion.div>
            ))}
            
            {/* Add New Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + goals.length * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => setIsNewGoalModalOpen(true)}
              className="bg-slate-800/60 rounded-2xl p-6 border-2 border-dashed border-slate-600/50 hover:border-emerald-500/50 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="text-center">
                <div className="p-4 bg-emerald-500/20 rounded-full mx-auto mb-4">
                  <Plus className="text-emerald-400" size={32} />
                </div>
                <p className="text-gray-400 font-medium">Adicionar Nova Meta</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center py-16"
          >
            <div className="p-6 bg-slate-800/50 rounded-full mx-auto mb-6 w-fit">
              <Target className="text-gray-600" size={64} />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Nenhuma meta criada</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Comece definindo suas metas financeiras para acompanhar seu progresso e alcançar seus objetivos
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNewGoalModalOpen(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 mx-auto"
            >
              <Target size={18} />
              Criar Primeira Meta
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      <NewGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
      />
    </>
  );
};

export default Metas;