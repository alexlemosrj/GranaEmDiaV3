import React, { useState } from 'react';
import { Plus, Search, Filter, Target } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import TransactionItem from '../components/TransactionItem';
import StatCard from '../components/StatCard';
import NewTransactionModal from '../components/NewTransactionModal';
import { Wallet, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Transacoes = () => {
  const { transactions, balance, monthlyIncome, monthlyExpenses } = useFinanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
            <h2 className="text-xl font-semibold text-white">Transações</h2>
            <button 
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors justify-center sm:justify-start"
            >
              <Plus size={16} />
              Nova Transação
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Saldo Total"
            value={`R$${balance.toLocaleString('pt-BR')}`}
            icon={Wallet}
            bgColor="bg-blue-900"
            borderColor="border-blue-500"
          />
          <StatCard
            title="Receitas do Mês"
            value={`R$${monthlyIncome.toLocaleString('pt-BR')}`}
            icon={ArrowUp}
            bgColor="bg-green-900"
            borderColor="border-green-500"
          />
          <StatCard
            title="Despesas do Mês"
            value={`R$${monthlyExpenses.toLocaleString('pt-BR')}`}
            icon={ArrowDown}
            bgColor="bg-red-900"
            borderColor="border-red-500"
          />
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todas as categorias</option>
                <option value="Moradia">Moradia</option>
                <option value="Mercado">Mercado</option>
                <option value="Freelance">Freelance</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">
            Todas as Transações ({filteredTransactions.length})
          </h3>
          <div className="space-y-2">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
        </div>
      </motion.div>

      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
      />
    </>
  );
};

export default Transacoes;