import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  title: string;
  subtitle?: string;
}

const LineChart: React.FC<LineChartProps> = ({ title, subtitle }) => {
  const { theme } = useTheme();
  
  const data = {
    labels: ['Q2/10', 'Q3/10', 'Q4/10', 'Q5/10', 'Q6/10', 'Q7/10', 'Q8/10', 'Q9/10'],
    datasets: [
      {
        label: 'Saldo',
        data: [1200, 1350, 1100, 1400, 1600, 1450, 1700, 1540],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
        {subtitle && (
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="h-48">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default LineChart;