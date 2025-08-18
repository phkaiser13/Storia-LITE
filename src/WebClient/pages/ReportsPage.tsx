
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiFileText, FiTool } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const fetchExpiringItems = async (days: number): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/reports/expiring-items', { params: { days } });
  return data;
};

const ReportsPage: React.FC = () => {
    const [days, setDays] = useState(30);
    const [submittedDays, setSubmittedDays] = useState(30);

    const { data: expiringItems, isLoading, isError, error } = useQuery<ItemDto[], Error>({
        queryKey: ['expiringItems', submittedDays],
        queryFn: () => fetchExpiringItems(submittedDays),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedDays(days);
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Reports</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex items-center mb-4">
                    <FiFileText className="h-8 w-8 text-primary-500 mr-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Expiring Items Report</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Generate a list of items that will expire within a specified number of days from now.</p>
                
                <form onSubmit={handleGenerateReport} className="flex items-end space-x-4 mb-6">
                    <div>
                        <label htmlFor="days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Days until expiration</label>
                        <input
                            type="number"
                            id="days"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            min="1"
                            className="mt-1 block w-32 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button type="submit" className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                        Generate Report
                    </button>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiration Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                           {isLoading ? (
                                <tr><td colSpan={4} className="py-10"><LoadingSpinner /></td></tr>
                           ) : isError ? (
                                <tr><td colSpan={4} className="text-center py-10 text-red-500">Error loading report: {error.message}</td></tr>
                           ) : expiringItems?.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">No items expiring within {submittedDays} days.</td></tr>
                           ) : (
                                expiringItems?.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 dark:text-yellow-400">{new Date(item.expirationDate!).toLocaleDateString()}</td>
                                    </tr>
                                ))
                           )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center opacity-60">
                <div className="flex justify-center items-center">
                    <FiTool className="h-12 w-12 text-primary-500 mb-4" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">More Reports Coming Soon</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Advanced reports, including user movement analysis and inventory value, are currently under development.
                </p>
            </div>
        </div>
    );
};

export default ReportsPage;
