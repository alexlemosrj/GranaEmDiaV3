import React, { useState } from 'react';
import { Wallet, ArrowUp, ArrowDown, Settings, Target } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import StatCard from '../components/StatCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DoughnutChart from '../components/charts/DoughnutChart';
import GoalCard from '../components/GoalCard';
import NewGoalModal from '../components/NewGoalModal';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { balance, monthlyIncome, monthlyExpenses, goals } = useFinanceStore();
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header com título em bloco escuro */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <StatCard
                title="Saldo Total"
                value={`R$${balance.toLocaleString('pt-BR')}`}
                subtitle="+R$1.400 vs anterior"
                icon={Wallet}
                bgColor="bg-gradient-to-br from-blue-900/80 to-blue-800/60"
                borderColor="border-blue-500/50"
                subtitleColor="text-green-400"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <StatCard
                title="Receitas do Mês"
                value={`R$${monthlyIncome.toLocaleString('pt-BR')}`}
                icon={ArrowUp}
                bgColor="bg-gradient-to-br from-green-900/80 to-green-800/60"
                borderColor="border-green-500/50"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <StatCard
                title="Despesas do Mês"
                value={`R$${monthlyExpenses.toLocaleString('pt-BR')}`}
                icon={ArrowDown}
                bgColor="bg-gradient-to-br from-red-900/80 to-red-800/60"
                borderColor="border-red-500/50"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <StatCard
                title="Metas Ativas"
                value={goals.length.toString()}
                icon={Settings}
                bgColor="bg-gradient-to-br from-purple-900/80 to-purple-800/60"
                borderColor="border-purple-500/50"
              />
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <LineChart 
                title="Evolução do Saldo" 
                subtitle="Análise em tempo real • 8 pontos de dados"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <BarChart title="Receitas vs Despesas (6 meses)" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              whileHover={{ y: -5 }}
            >
              <DoughnutChart title="Despesas por Categoria" />
            </motion.div>
          </div>

          {/* Goals Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mb-8"
          >
            {/* Header das metas em bloco escuro */}
            <div className="bg-slate-800 rounded-xl p-6 shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">Metas Financeiras</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNewGoalModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 justify-center sm:justify-start"
                >
                  <Target size={18} />
                  Nova Meta
                </motion.button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      <NewGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
      />
    </>
  );
};

export default Dashboard;