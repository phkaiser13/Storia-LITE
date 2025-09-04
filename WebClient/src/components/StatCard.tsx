import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isLoading = false }) => {
  return (
    <div className="group relative bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border flex items-center space-x-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-primary [transform-style:preserve-3d]">
      <div className="absolute inset-0 bg-gradient-surface-dark rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative p-4 rounded-xl bg-primary-500/10 text-primary-500 dark:text-primary-400 z-10">
        {icon}
      </div>
      <div className="flex-1 relative z-10">
        <p className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted capitalize">{title}</p>
        {isLoading ? (
            <div className="h-8 mt-1 w-2/3 bg-slate-200 dark:bg-white/10 rounded animate-pulse"></div>
        ) : (
            <p className="text-3xl font-heading font-bold text-light-text dark:text-dark-text">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
