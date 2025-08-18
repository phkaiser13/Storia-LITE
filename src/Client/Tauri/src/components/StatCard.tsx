import React, { ReactNode } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, isLoading = false }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.03]">
      <div className="bg-primary-100 dark:bg-gray-700 p-4 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {isLoading ? (
            <div className="h-8 w-16 mt-1 flex items-center">
                <LoadingSpinner />
            </div>
        ) : (
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;