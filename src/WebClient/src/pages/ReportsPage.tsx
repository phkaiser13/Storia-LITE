
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

    const { data: expiringItems, isLoading, isError, error, isFetching } = useQuery<ItemDto[], Error>({
        queryKey: ['expiringItems', submittedDays],
        queryFn: () => fetchExpiringItems(submittedDays),
        staleTime: 5 * 60 * 1000,
    });

    const handleGenerateReport = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedDays(days);
    }

    return (
        <div className="animate-slide-in">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">Relatórios</h1>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
                <div className="flex items-center mb-4">
                    <FiFileText className="h-8 w-8 text-primary-500 mr-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Relatório de Itens a Vencer</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Gere uma lista de itens que irão expirar dentro de um número especificado de dias.</p>
                
                <form onSubmit={handleGenerateReport} className="flex flex-wrap items-end gap-4 mb-6">
                    <div>
                        <label htmlFor="days" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dias para o vencimento</label>
                        <input
                            type="number"
                            id="days"
                            value={days}
                            onChange={(e) => setDays(Number(e.target.value))}
                            min="1"
                            className="mt-1 block w-40 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <button type="submit" disabled={isFetching} className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400 disabled:cursor-wait">
                        {isFetching ? 'Gerando...' : 'Gerar Relatório'}
                    </button>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantidade</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Localização</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data de Vencimento</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                           {isLoading ? (
                                <tr><td colSpan={4} className="py-16"><LoadingSpinner /></td></tr>
                           ) : isError ? (
                                <tr><td colSpan={4} className="text-center py-16 text-red-500">Erro ao carregar o relatório: {error.message}</td></tr>
                           ) : expiringItems?.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-16 text-gray-500 dark:text-gray-400">Nenhum item vencendo nos próximos {submittedDays} dias.</td></tr>
                           ) : (
                                expiringItems?.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{item.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-600 dark:text-yellow-400">{new Date(item.expirationDate!).toLocaleDateString('pt-BR')}</td>
                                    </tr>
                                ))
                           )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center opacity-70">
                <div className="flex justify-center items-center mb-4">
                    <FiTool className="h-12 w-12 text-primary-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Mais Relatórios em Breve</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    Relatórios avançados, incluindo análise de movimentação de usuário e valor de inventário, estão em desenvolvimento.
                </p>
            </div>
        </div>
    );
};

export default ReportsPage;
