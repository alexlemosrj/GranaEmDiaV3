import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ title }) => {
  const { theme } = useTheme();
  
  const data = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Receitas',
        data: [3200, 3500, 3100, 3400, 3600, 3500],
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Despesas',
        data: [2100, 1960, 2200, 1800, 2000, 1960],
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme === 'dark' ? '#f1f5f9' : '#374151',
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        titleColor: theme === 'dark' ? '#f1f5f9' : '#1f2937',
        bodyColor: theme === 'dark' ? '#f1f5f9' : '#1f2937',
        borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: theme === 'dark' ? '#334155' : '#e5e7eb',
        },
        ticks: {
          color: theme === 'dark' ? '#94a3b8' : '#6b7280',
          callback: function(value: any) {
            return 'R$' + value;
          },
        },
      },
    },
  };

  return (
    <div className={`rounded-xl p-6 h-64 shadow-lg transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-800' 
        : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h3>
      </div>
      <div className="h-48">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default BarChart;