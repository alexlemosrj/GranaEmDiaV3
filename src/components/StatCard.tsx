import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  subtitleColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor,
  borderColor,
  subtitleColor = 'text-gray-400'
}) => {
  return (
    <div className={`${bgColor} ${borderColor} border-l-4 rounded-xl p-6 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-100 text-sm mb-2 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className={`text-sm ${subtitleColor} font-medium`}>{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-white/10 rounded-full">
          <Icon className="text-white/80" size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;