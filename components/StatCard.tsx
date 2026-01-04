import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  subValue?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendDirection, icon, subValue, onClick }) => {
  const trendColor = 
    trendDirection === 'up' ? 'text-trading-green' : 
    trendDirection === 'down' ? 'text-trading-red' : 'text-gray-400';

  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`} {...(onClick ? { onClick } : {})}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-gray-500">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {subValue && <span className="text-sm text-gray-500">{subValue}</span>}
      </div>
      {trend && (
        <div className={`text-xs mt-2 font-medium ${trendColor} flex items-center`}>
          {trendDirection === 'up' && '▲'}
          {trendDirection === 'down' && '▼'}
          <span className="ml-1">{trend}</span>
        </div>
      )}
    </div>
  );
};
