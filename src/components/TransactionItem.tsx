import React from 'react';
import { ShoppingBag, DollarSign, Home, Users } from 'lucide-react';
import { Transaction } from '../store/useFinanceStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mercado':
        return ShoppingBag;
      case 'Moradia':
        return Home;
      case 'Freelance':
        return DollarSign;
      default:
        return Users;
    }
  };

  const Icon = getCategoryIcon(transaction.category);
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-700 last:border-b-0">
      <div className={`p-2 rounded-full ${isPositive ? 'bg-green-900' : 'bg-red-900'}`}>
        <Icon 
          size={20} 
          className={isPositive ? 'text-green-400' : 'text-red-400'} 
        />
      </div>
      
      <div className="flex-1">
        <p className="text-white font-medium">{transaction.description}</p>
        <p className="text-gray-400 text-sm">
          {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
        </p>
      </div>
      
      <div className="text-right">
        <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}R${Math.abs(transaction.amount).toLocaleString('pt-BR')}
        </p>
        <p className="text-gray-400 text-sm">{transaction.category}</p>
      </div>
    </div>
  );
};

export default TransactionItem;