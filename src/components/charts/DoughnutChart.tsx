import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
  title: string;
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ title }) => {
  const { theme } = useTheme();
  
  const data = {
    labels: ['Moradia', 'Mercado', 'Outros'],
    datasets: [
      {
        data: [50, 30, 20],
        backgroundColor: ['#ef4444', '#f97316', '#06b6d4'],
        borderColor: ['#dc2626', '#ea580c', '#0891b2'],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: theme === 'dark' ? '#f1f5f9' : '#374151',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
        titleColor: theme === 'dark' ? '#f1f5f9' : '#1f2937',
        bodyColor: theme === 'dark' ? '#f1f5f9' : '#1f2937',
        borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%';
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
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;