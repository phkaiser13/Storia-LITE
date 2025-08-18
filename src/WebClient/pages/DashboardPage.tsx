import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import { FiPackage, FiAlertTriangle, FiUserCheck } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto } from '../types';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: items, isLoading: isLoadingItems } = useQuery<ItemDto[], Error>({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const expiringSoonCount = items?.filter(item => {
    if (!item.expirationDate) return false;
    const expiration = new Date(item.expirationDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiration > today && expiration <= thirtyDaysFromNow;
  }).length ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Here's a snapshot of your inventory.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Items" 
          value={items?.length ?? 0}
          isLoading={isLoadingItems}
          icon={<FiPackage className="h-6 w-6 text-primary-600 dark:text-primary-300" />} 
        />
        <StatCard 
          title="Expiring Soon" 
          value={expiringSoonCount}
          isLoading={isLoadingItems}
          icon={<FiAlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-400" />} 
        />
        <StatCard 
          title="Your Role" 
          value={user?.role ?? 'N/A'}
          icon={<FiUserCheck className="h-6 w-6 text-green-500 dark:text-green-400" />} 
        />
      </div>

      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Getting Started</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Use the navigation bar on the left to manage items, view movements, or generate reports.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
