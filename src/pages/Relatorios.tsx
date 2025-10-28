import React, { useState } from 'react';
import { FileText, Download, TrendingUp, Calculator, Calendar } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../contexts/ThemeContext';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import { motion } from 'framer-motion';

const Relatorios = () => {
  const { transactions } = useFinanceStore();
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-12-31' });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
    return transactionDate >= startDate && transactionDate <= endDate && categoryMatch;
  });

  const totalIncome = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : '0.0';

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthTransactions = filteredTransactions.filter(t => new Date(t.date).getMonth() + 1 === month);
    const income = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    return {
      month: new Date(2025, i, 1).toLocaleString('default', { month: 'long' }),
      income,
      expenses,
      balance: income - expenses,
    };
  });

  const yearlyTotals = monthlyData.reduce((acc, month) => ({
    income: acc.income + month.income,
    expenses: acc.expenses + month.expenses,
    balance: acc.balance + month.balance
  }), { income: 0, expenses: 0, balance: 0 });

  const categories = [...new Set(transactions.map(t => t.category))];

  const exportToPDF = () => {
    const dataStr = JSON.stringify(filteredTransactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(item => [
        item.date,
        `"${item.description}"`,
        item.category,
        item.amount
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className={`text-xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Relatórios
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={exportToPDF}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <Download size={16} />
            PDF
          </button>
          <button 
            onClick={exportToCSV}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      {/* Resumo Anual */}
      <div className={`rounded-lg p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <Calendar className={theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'} size={24} />
          <h3 className={`text-xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Resumo Anual 2025
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <p className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
            }`}>
              R$ {yearlyTotals.income.toLocaleString('pt-BR')}
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total de Receitas
            </p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-red-400' : 'text-red-600'
            }`}>
              R$ {yearlyTotals.expenses.toLocaleString('pt-BR')}
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total de Despesas
            </p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
            }`}>
              R$ {yearlyTotals.balance.toLocaleString('pt-BR')}
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Saldo Acumulado
            </p>
          </div>
        </div>
      </div>

      {/* Resumo Mensal */}
      <div className={`rounded-lg p-6 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Resumo Mensal (Janeiro - Outubro 2025)
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <th className={`text-left font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Mês
                </th>
                <th className={`text-right font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Receitas
                </th>
                <th className={`text-right font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Despesas
                </th>
                <th className={`text-right font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => (
                <tr key={index} className={`border-b transition-colors ${
                  theme === 'dark' 
                    ? 'border-slate-700 hover:bg-slate-700/50' 
                    : 'border-gray-100 hover:bg-teal-50'
                }`}>
                  <td className={`py-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {month.month}
                  </td>
                  <td className={`py-3 text-right font-semibold ${
                    theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    R$ {month.income.toLocaleString('pt-BR')}
                  </td>
                  <td className={`py-3 text-right font-semibold ${
                    theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    R$ {month.expenses.toLocaleString('pt-BR')}
                  </td>
                  <td className={`py-3 text-right font-semibold ${
                    month.balance > 0 
                      ? theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    R$ {month.balance.toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtros */}
      <div className={`rounded-lg p-4 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Filtros
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Data Início
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Data Fim
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
              }`}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none transition-colors ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-white focus:border-emerald-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
              }`}
            >
              <option value="all">Todas</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className={theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} size={20} />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Taxa de Poupança
            </h3>
          </div>
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            {savingsRate}%
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Receitas - Despesas / Receitas
          </p>
        </div>
        
        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <Calculator className={theme === 'dark' ? 'text-violet-400' : 'text-violet-600'} size={20} />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Receita Média
            </h3>
          </div>
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            R${(totalIncome / 4).toLocaleString('pt-BR')}
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Por semana
          </p>
        </div>
        
        <div className={`rounded-lg p-4 ${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <FileText className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} size={20} />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Transações
            </h3>
          </div>
          <p className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {filteredTransactions.length}
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Este mês
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart title="Evolução Anual (12 meses)" />
        <BarChart title="Despesas por Categoria" />
      </div>

      {/* Data Table */}
      <div className={`rounded-lg p-4 ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-teal-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Dados Detalhados
          </h3>
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {filteredTransactions.length} registros
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <th className={`text-left font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Data
                </th>
                <th className={`text-left font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Descrição
                </th>
                <th className={`text-left font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Categoria
                </th>
                <th className={`text-right font-medium py-3 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((item, index) => (
                <tr key={index} className={`border-b transition-colors ${
                  theme === 'dark' 
                    ? 'border-slate-700 hover:bg-slate-700/50' 
                    : 'border-gray-100 hover:bg-teal-50'
                }`}>
                  <td className={`py-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {new Date(item.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className={`py-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.description}
                  </td>
                  <td className={`py-3 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.category}
                  </td>
                  <td className={`py-3 text-right font-semibold ${
                    item.amount > 0 
                      ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                      : theme === 'dark' ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {item.amount > 0 ? '+' : ''}R${Math.abs(item.amount).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Mostrando 1-10 de {filteredTransactions.length}
          </span>
          <div className="flex gap-2 justify-center sm:justify-end">
            <button className={`px-3 py-1 rounded transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}>
              Anterior
            </button>
            <button className="px-3 py-1 bg-violet-600 text-white rounded">1</button>
            <button className={`px-3 py-1 rounded transition-colors ${
              theme === 'dark' 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}>
              Próximo
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Relatorios;