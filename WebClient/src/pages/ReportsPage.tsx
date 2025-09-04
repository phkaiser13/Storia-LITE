import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiFileText, FiDownload, FiDollarSign, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto, MovementDto, CostByCenterDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToCsv } from '../utils/export';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const fetchExpiringItems = async (days: number): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/reports/expiring-items', { params: { days } });
  return data;
};

const fetchOverdueReturns = async (): Promise<MovementDto[]> => {
  const { data } = await api.get('/api/reports/overdue-returns');
  return data;
};

const fetchCostByCenter = async ({ from, to }: { from: string; to: string }): Promise<CostByCenterDto[]> => {
  const { data } = await api.get('/api/reports/cost-by-center', { params: { from, to } });
  return data;
};

const ReportsPage: React.FC = () => {
    const [expiringDays, setExpiringDays] = useState(30);
    const [submittedExpiringDays, setSubmittedExpiringDays] = useState(30);
    
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [submittedDateRange, setSubmittedDateRange] = useState<{ from: string; to: string } | null>(null);
    const [expandedCenter, setExpandedCenter] = useState<string | null>(null);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const chartTextColor = isDarkMode ? 'rgba(224, 224, 255, 0.8)' : 'rgba(22, 22, 51, 0.8)';
    const chartGridColor = isDarkMode ? 'rgba(126, 87, 255, 0.1)' : 'rgba(22, 22, 51, 0.05)';
  
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, title: { display: true, text: 'Custo Total por Centro de Custo', color: chartTextColor } },
        scales: {
            x: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
            y: { ticks: { color: chartTextColor }, grid: { color: chartGridColor } },
        }
    };

    const { data: expiringItems, isFetching: isFetchingExpiring } = useQuery<ItemDto[], Error>({
        queryKey: ['expiringItems', submittedExpiringDays],
        queryFn: () => fetchExpiringItems(submittedExpiringDays),
        staleTime: 5 * 60 * 1000,
    });
    
    const { data: overdueReturns, isFetching: isFetchingOverdue } = useQuery<MovementDto[], Error>({
        queryKey: ['overdueReturns'],
        queryFn: fetchOverdueReturns,
        staleTime: 5 * 60 * 1000,
    });
    
    const { data: costByCenterData, isFetching: isFetchingCost } = useQuery<CostByCenterDto[], Error>({
        queryKey: ['costByCenter', submittedDateRange],
        queryFn: () => fetchCostByCenter(submittedDateRange!),
        enabled: !!submittedDateRange,
        staleTime: 5 * 60 * 1000,
    });

    const costByCenterChartData = {
        labels: costByCenterData?.map(d => d.costCenter || 'N/A') ?? [],
        datasets: [{
            label: 'Custo Total',
            data: costByCenterData?.map(d => d.totalCost) ?? [],
            backgroundColor: 'rgba(126, 87, 255, 0.6)',
            borderColor: 'rgba(126, 87, 255, 1)',
            borderWidth: 1,
        }]
    };

    const handleGenerateExpiringReport = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittedExpiringDays(expiringDays);
    }
    
    const handleGenerateCostReport = (e: React.FormEvent) => {
        e.preventDefault();
        if(dateRange.from && dateRange.to) {
            setSubmittedDateRange(dateRange);
        } else {
            alert("Por favor, selecione um período de datas.");
        }
    };

    const calculateDaysOverdue = (returnDate: Date | string | undefined): number => {
        if (!returnDate) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expected = new Date(returnDate);
        if (expected >= today) return 0;
        const diffTime = today.getTime() - expected.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const handleExport = (data: any[], filename: string) => {
        if (data && data.length > 0) {
            exportToCsv(data, filename);
        }
    };

    const toggleCenterExpansion = (center: string) => {
      setExpandedCenter(expandedCenter === center ? null : center);
    }

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Relatórios e Análises</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Gere e visualize relatórios importantes sobre o seu inventário.</p>
            </div>

            <ReportCard
                title="Relatório de Custo por Centro de Custo"
                description="Valor total de itens retirados por cada centro de custo para auxiliar no controle de despesas."
                icon={<FiDollarSign className="h-8 w-8 text-emerald-500" />}
            >
                <form onSubmit={handleGenerateCostReport} className="flex flex-wrap items-end gap-4 mb-6">
                    <div>
                        <label htmlFor="from" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted">De</label>
                        <input type="date" id="from" value={dateRange.from} onChange={e => setDateRange(prev => ({...prev, from: e.target.value}))} required className="mt-1 block w-48 px-4 py-2 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="to" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Até</label>
                        <input type="date" id="to" value={dateRange.to} onChange={e => setDateRange(prev => ({...prev, to: e.target.value}))} required className="mt-1 block w-48 px-4 py-2 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <button type="submit" disabled={isFetchingCost} className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                        {isFetchingCost ? 'Gerando...' : 'Gerar Relatório'}
                    </button>
                    <button type="button" onClick={() => handleExport(costByCenterData?.flatMap(group => group.movements.map(m => ({ 'Centro de Custo': group.costCenter, 'Item': m.item?.name, 'Quantidade': m.quantity, 'Custo Unit.': m.item?.cost ?? 0, 'Custo Total': (m.item?.cost ?? 0) * m.quantity, 'Data': new Date(m.date).toLocaleDateString('pt-BR'), 'Colaborador': m.recipient?.fullName }))) || [], 'relatorio_custo_por_centro_de_custo')} disabled={!costByCenterData || costByCenterData.length === 0} className="flex items-center ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <FiDownload className="mr-2 h-4 w-4" /> Exportar
                    </button>
                </form>
                {submittedDateRange && (
                    isFetchingCost ? <div className="py-10"><LoadingSpinner /></div> :
                    !costByCenterData || costByCenterData.length === 0 ? <div className="text-center py-10 text-light-text-muted dark:text-dark-text-muted">Nenhum dado encontrado para o período selecionado.</div> :
                    <div>
                      <div className="h-80 mb-6">
                          <Bar options={barChartOptions} data={costByCenterChartData} />
                      </div>
                      <div className="space-y-2">
                          {costByCenterData.map(group => (
                              <div key={group.costCenter} className="border border-light-border dark:border-dark-border rounded-lg">
                                  <button onClick={() => toggleCenterExpansion(group.costCenter)} className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                      <div>
                                          <p className="font-semibold text-light-text dark:text-dark-text">{group.costCenter || 'Não Especificado'}</p>
                                          <p className="text-sm text-light-text-muted dark:text-dark-text-muted">{group.movements.length} retiradas</p>
                                      </div>
                                      <div className="flex items-center gap-4">
                                          <p className="font-bold text-lg text-primary-600 dark:text-primary-400">
                                              {group.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                          </p>
                                          {expandedCenter === group.costCenter ? <FiChevronUp className="h-5 w-5 text-slate-400"/> : <FiChevronDown className="h-5 w-5 text-slate-400"/>}
                                      </div>
                                  </button>
                                  {expandedCenter === group.costCenter && (
                                      <div className="p-4 border-t border-light-border dark:border-dark-border">
                                          <ReportTable
                                              isLoading={isFetchingCost}
                                              headers={['Item', 'Colaborador', 'Qtd.', 'Custo Unit.', 'Custo Total']}
                                              data={group.movements}
                                              renderRow={(m: MovementDto) => (
                                                  <tr key={m.id}>
                                                      <td className="px-6 py-4 text-sm font-medium">{m.item?.name}</td>
                                                      <td className="px-6 py-4 text-sm">{m.recipient?.fullName}</td>
                                                      <td className="px-6 py-4 text-sm">{m.quantity}</td>
                                                      <td className="px-6 py-4 text-sm">{(m.item?.cost ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                      <td className="px-6 py-4 text-sm font-semibold">{((m.item?.cost ?? 0) * m.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                  </tr>
                                              )}
                                          />
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                    </div>
                )}
            </ReportCard>

            <ReportCard
                title="Relatório de Itens a Vencer"
                description="Liste itens que irão expirar dentro de um período específico."
                icon={<FiFileText className="h-8 w-8 text-primary-500" />}
            >
                <form onSubmit={handleGenerateExpiringReport} className="flex flex-wrap items-end gap-4 mb-6">
                     <div>
                        <label htmlFor="days" className="block text-sm font-medium text-light-text-muted dark:text-dark-text-muted">Dias para vencer</label>
                        <input type="number" id="days" value={expiringDays} onChange={(e) => setExpiringDays(Number(e.target.value))} min="1" className="mt-1 block w-40 px-4 py-2 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <button type="submit" disabled={isFetchingExpiring} className="px-5 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                        {isFetchingExpiring ? 'Gerando...' : 'Gerar Relatório'}
                    </button>
                    <button type="button" onClick={() => handleExport(expiringItems?.map(item => ({'Nome': item.name, 'Quantidade': item.quantity, 'Localização': item.location, 'Data de Vencimento': new Date(item.expirationDate!).toLocaleDateString('pt-BR')})) || [], `relatorio_vencimento_${submittedExpiringDays}_dias`)} disabled={!expiringItems || expiringItems.length === 0} className="flex items-center ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <FiDownload className="mr-2 h-4 w-4" /> Exportar
                    </button>
                </form>
                <ReportTable
                    isLoading={isFetchingExpiring}
                    headers={['Nome', 'Quantidade', 'Data de Vencimento']}
                    renderRow={(item: ItemDto) => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 dark:text-amber-400 font-medium">{new Date(item.expirationDate!).toLocaleDateString('pt-BR')}</td>
                        </tr>
                    )}
                    data={expiringItems}
                    emptyMessage={`Nenhum item vencendo nos próximos ${submittedExpiringDays} dias.`}
                />
            </ReportCard>
            
            <ReportCard
                title="Relatório de Devoluções Atrasadas"
                description="Painel destacando itens que foram retirados e não devolvidos no prazo esperado."
                icon={<FiCalendar className="h-8 w-8 text-red-500" />}
            >
                <div className="flex justify-end mb-6">
                    <button type="button" onClick={() => handleExport(overdueReturns?.map(m => ({ 'Item': m.item?.name, 'Colaborador': m.recipient?.fullName, 'Data de Retirada': new Date(m.date).toLocaleDateString('pt-BR'), 'Devolução Esperada': new Date(m.expectedReturnDate!).toLocaleDateString('pt-BR'), 'Dias Atrasado': calculateDaysOverdue(m.expectedReturnDate) })) || [], 'relatorio_devolucoes_atrasadas')} disabled={!overdueReturns || overdueReturns.length === 0} className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold rounded-lg transition-colors disabled:opacity-50">
                        <FiDownload className="mr-2 h-4 w-4" /> Exportar
                    </button>
                </div>
                 <ReportTable
                    isLoading={isFetchingOverdue}
                    headers={['Item', 'Colaborador', 'Devolução Esperada', 'Dias Atrasado']}
                    renderRow={(item: MovementDto) => {
                        const daysOverdue = calculateDaysOverdue(item.expectedReturnDate);
                        return (
                             <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{item.item?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.recipient?.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{new Date(item.expectedReturnDate!).toLocaleDateString('pt-BR')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-bold">{daysOverdue}</td>
                            </tr>
                        )
                    }}
                    data={overdueReturns}
                    emptyMessage="Nenhum item com devolução atrasada."
                />
            </ReportCard>
        </div>
    );
};

// Helper Components
const ReportCard: React.FC<{ title: string; description: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, description, icon, children }) => (
    <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border">
        <div className="p-6 border-b border-light-border dark:border-dark-border flex items-start md:items-center gap-4 flex-col md:flex-row">
            <div className='p-3 bg-slate-100 dark:bg-dark-surface/50 rounded-xl'>{icon}</div>
            <div>
                <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">{title}</h2>
                <p className="text-light-text-muted dark:text-dark-text-muted mt-1 text-sm">{description}</p>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const ReportTable: React.FC<{ isLoading: boolean; headers: string[]; data: any[] | undefined; renderRow: (item: any) => React.ReactNode; emptyMessage?: string }> = ({ isLoading, headers, data, renderRow, emptyMessage = "Nenhum dado encontrado." }) => (
    <div className="overflow-x-auto border border-light-border dark:border-dark-border rounded-lg">
        <table className="w-full min-w-full">
            <thead className="bg-slate-50 dark:bg-dark-surface/80">
                <tr>
                    {headers.map(header => <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">{header}</th>)}
                </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border text-light-text dark:text-dark-text">
                {isLoading ? (
                    <tr><td colSpan={headers.length} className="py-10"><LoadingSpinner /></td></tr>
                ) : !data || data.length === 0 ? (
                    <tr><td colSpan={headers.length} className="text-center py-10 text-light-text-muted dark:text-dark-text-muted">{emptyMessage}</td></tr>
                ) : (
                    data.map(renderRow)
                )}
            </tbody>
        </table>
    </div>
);


export default ReportsPage;
