import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiTool, FiAlertTriangle, FiCheckCircle, FiClock, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto } from '../types';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToCsv } from '../utils/export';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const getMaintenanceStatus = (item: ItemDto) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (item.nextMaintenanceDate) {
        const maintenanceDate = new Date(item.nextMaintenanceDate);
        if (maintenanceDate < today) {
            return { text: 'Atrasada', color: 'red', icon: <FiAlertTriangle /> };
        }
        if (maintenanceDate <= thirtyDaysFromNow) {
            return { text: 'Próxima', color: 'amber', icon: <FiClock /> };
        }
    }

    return { text: 'Em Dia', color: 'emerald', icon: <FiCheckCircle /> };
}

const MaintenancePage: React.FC = () => {
    const { data: allItems, isLoading } = useQuery<ItemDto[], Error>({
        queryKey: ['items'],
        queryFn: fetchItems
    });

    const maintenanceItems = allItems?.filter(item => item.requiresMaintenance) || [];

    const stats = maintenanceItems.reduce((acc, item) => {
        const status = getMaintenanceStatus(item).text;
        if (status === 'Atrasada') {
            acc.overdue += 1;
        }
        if (status === 'Próxima') {
            acc.dueSoon += 1;
        }
        if (status === 'Em Dia') {
            acc.upToDate += 1;
        }
        return acc;
    }, { total: maintenanceItems.length, overdue: 0, dueSoon: 0, upToDate: 0 });

    const handleExport = () => {
        const dataToExport = maintenanceItems.map(item => ({
            'Equipamento': item.name,
            'Status': getMaintenanceStatus(item).text,
            'Quantidade em Estoque': item.quantity,
            'Próxima Manutenção': item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString('pt-BR') : 'N/A',
        }));
        exportToCsv(dataToExport, 'relatorio_manutencao');
    };
    
    const statusColors = {
        red: 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200',
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200',
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Painel de Manutenção</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Monitore o status de manutenção de seus equipamentos e ferramentas.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Itens Monitorados" 
                    value={stats.total}
                    isLoading={isLoading}
                    icon={<FiTool className="h-6 w-6" />} 
                />
                <StatCard 
                    title="Manutenção Atrasada" 
                    value={stats.overdue}
                    isLoading={isLoading}
                    icon={<FiAlertTriangle className="h-6 w-6 text-red-500" />} 
                />
                <StatCard 
                    title="Manutenção Próxima" 
                    value={stats.dueSoon}
                    isLoading={isLoading}
                    icon={<FiClock className="h-6 w-6 text-amber-500" />} 
                />
                <StatCard 
                    title="Em Dia" 
                    value={stats.upToDate}
                    isLoading={isLoading}
                    icon={<FiCheckCircle className="h-6 w-6 text-emerald-500" />} 
                />
            </div>
            
             <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Lista de Equipamentos</h2>
                     <button
                        onClick={handleExport}
                        disabled={isLoading || maintenanceItems.length === 0}
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Equipamento</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Quantidade em Estoque</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Próxima Manutenção</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                             {isLoading ? (
                                <tr><td colSpan={4} className="py-16"><LoadingSpinner /></td></tr>
                            ) : maintenanceItems.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhum item com manutenção agendada.</td></tr>
                            ) : (
                                maintenanceItems.map(item => {
                                    const status = getMaintenanceStatus(item);
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString('pt-BR') : 'Não agendada'}</td>
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

export default MaintenancePage;
