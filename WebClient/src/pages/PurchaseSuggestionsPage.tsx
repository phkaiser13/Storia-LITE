import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiShoppingCart, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToCsv } from '../utils/export';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const PurchaseSuggestionsPage: React.FC = () => {
    const { data: allItems, isLoading } = useQuery<ItemDto[], Error>({
        queryKey: ['items'],
        queryFn: fetchItems
    });

    const suggestedItems = allItems
        ?.filter(item => item.minStock && item.quantity < item.minStock)
        .map(item => {
            const maxStock = item.maxStock ?? item.minStock! * 1.5; // Use maxStock or default to 150% of minStock
            const suggestedQuantity = Math.ceil(maxStock - item.quantity);
            return {
                ...item,
                suggestedQuantity: Math.max(1, suggestedQuantity) // Ensure we suggest at least 1
            };
        }) || [];
    
    const handleExport = () => {
        const dataToExport = suggestedItems.map(item => ({
            'Item': item.name,
            'Estoque Atual': item.quantity,
            'Estoque Mínimo': item.minStock,
            'Estoque Máximo': item.maxStock ?? 'N/A',
            'Sugestão de Compra': item.suggestedQuantity
        }));
        exportToCsv(dataToExport, 'sugestoes_de_compra');
    };

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Sugestões de Compra</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Lista de itens que atingiram o estoque mínimo e precisam de reposição.</p>
            </div>
            
             <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Lista de Compras Sugerida</h2>
                     <button
                        onClick={handleExport}
                        disabled={isLoading || suggestedItems.length === 0}
                        className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiDownload className="mr-2 h-4 w-4" />
                        Exportar para CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full">
                        <thead className="bg-slate-50 dark:bg-dark-surface/80">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Estoque Atual</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Estoque Mínimo</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Estoque Máximo</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Sugestão de Compra</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                             {isLoading ? (
                                <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
                            ) : suggestedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">
                                        <div className="flex flex-col items-center gap-2">
                                            <FiShoppingCart className="h-10 w-10 text-emerald-500" />
                                            <span className="font-semibold">Tudo certo por aqui!</span>
                                            <span>Nenhum item precisa de reposição no momento.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suggestedItems.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-red-600 dark:text-red-400">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-light-text-muted dark:text-dark-text-muted">{item.minStock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-light-text-muted dark:text-dark-text-muted">{item.maxStock ?? '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10">{item.suggestedQuantity}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

export default PurchaseSuggestionsPage;
