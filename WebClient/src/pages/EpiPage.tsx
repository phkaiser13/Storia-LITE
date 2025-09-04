import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiTool, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto } from '../types';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToCsv } from '../utils/export';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const getEpiStatus = (item: ItemDto) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (item.expirationDate) {
        const expiration = new Date(item.expirationDate);
        if (expiration < today) {
            return { text: 'Vencido', color: 'red', icon: <FiAlertTriangle/> };
        }
        if (expiration <= thirtyDaysFromNow) {
            return { text: 'Vence em Breve', color: 'amber', icon: <FiClock/> };
        }
    }
    
    if (item.nextInspectionDate) {
        const inspection = new Date(item.nextInspectionDate);
        if (inspection < today) {
            return { text: 'Inspeção Atrasada', color: 'red', icon: <FiTool/> };
        }
        if (inspection <= thirtyDaysFromNow) {
            return { text: 'Inspeção Próxima', color: 'amber', icon: <FiTool/> };
        }
    }

    return { text: 'Em Conformidade', color: 'emerald', icon: <FiCheckCircle/> };
}

const EpiPage: React.FC = () => {
    const { data: allItems, isLoading } = useQuery<ItemDto[], Error>({
        queryKey: ['items'],
        queryFn: fetchItems
    });

    const epiItems = allItems?.filter(item => item.isEPI) || [];

    const stats = epiItems.reduce((acc, item) => {
        const status = getEpiStatus(item).text;
        if (status === 'Vencido' || status === 'Inspeção Atrasada') {
            acc.expiredOrOverdue += 1;
        }
        if (status === 'Vence em Breve' || status === 'Inspeção Próxima') {
            acc.dueSoon += 1;
        }
        if (status === 'Em Conformidade') {
            acc.compliant += 1;
        }
        return acc;
    }, { total: epiItems.length, expiredOrOverdue: 0, dueSoon: 0, compliant: 0 });

    const handleExport = () => {
        const dataToExport = epiItems.map(item => ({
            'Nome do EPI': item.name,
            'Status': getEpiStatus(item).text,
            'Quantidade em Estoque': item.quantity,
            'Próxima Inspeção': item.nextInspectionDate ? new Date(item.nextInspectionDate).toLocaleDateString('pt-BR') : 'N/A',
            'Data de Validade': item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A',
        }));
        exportToCsv(dataToExport, 'relatorio_conformidade_epis');
    };

    const statusColors = {
        red: 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200',
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Painel de Conformidade de EPIs</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Monitore o status de todos os Equipamentos de Proteção Individual.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total de EPIs" 
                    value={stats.total}
                    isLoading={isLoading}
                    icon={<FiShield className="h-6 w-6" />} 
                />
                <StatCard 
                    title="Vencidos / Inspeção Atrasada" 
                    value={stats.expiredOrOverdue}
                    isLoading={isLoading}
                    icon={<FiAlertTriangle className="h-6 w-6 text-red-500" />} 
                />
                <StatCard 
                    title="Vencimento / Inspeção Próxima" 
                    value={stats.dueSoon}
                    isLoading={isLoading}
                    icon={<FiClock className="h-6 w-6 text-amber-500" />} 
                />
                <StatCard 
                    title="Em Conformidade" 
                    value={stats.compliant}
                    isLoading={isLoading}
                    icon={<FiCheckCircle className="h-6 w-6 text-emerald-500" />} 
                />
            </div>
            
             <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Lista de EPIs</h2>
                     <button
                        onClick={handleExport}
                        disabled={isLoading || epiItems.length === 0}
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Nome do EPI</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Quantidade em Estoque</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Próxima Inspeção</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Data de Validade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                             {isLoading ? (
                                <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
                            ) : epiItems.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhum EPI cadastrado.</td></tr>
                            ) : (
                                epiItems.map(item => {
                                    const status = getEpiStatus(item);
                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${statusColors[status.color as keyof typeof statusColors]}`}>
                                                    {React.cloneElement(status.icon, { className: 'mr-1.5 h-3 w-3'})}
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.quantity}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.nextInspectionDate ? new Date(item.nextInspectionDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

export default EpiPage;
