import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import { FiPackage, FiAlertTriangle, FiUserCheck, FiArrowRight, FiPlusCircle, FiMinusCircle, FiFileText, FiBarChart2, FiUsers, FiClock, FiCheckCircle, FiShield, FiTrendingUp, FiRepeat } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto, Role, MovementDto, MovementType, UserDto } from '../types';
import { Link, useNavigate } from 'react-router-dom';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, ChartOptions, Filler } from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const fetchMovements = async (): Promise<MovementDto[]> => {
    const { data } = await api.get('/api/movements');
    return data.sort((a: MovementDto, b: MovementDto) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const fetchUsers = async (): Promise<UserDto[]> => {
  const { data } = await api.get('/api/users');
  return data;
};

const fetchUserEpiMovements = async (userId: string): Promise<MovementDto[]> => {
    const { data } = await api.get(`/api/movements/recipient/${userId}`);
    return data;
};


// Helper to get EPI status
const getEpiStatus = (item: ItemDto) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (item.expirationDate) {
        const expiration = new Date(item.expirationDate);
        if (expiration < today) return 'Vencido/Atrasado';
        if (expiration <= thirtyDaysFromNow) return 'Vencimento Próximo';
    }
    
    if (item.nextInspectionDate) {
        const inspection = new Date(item.nextInspectionDate);
        if (inspection < today) return 'Vencido/Atrasado';
        if (inspection <= thirtyDaysFromNow) return 'Vencimento Próximo';
    }

    return 'Em Conformidade';
};

const DashboardSkeleton: React.FC = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-28 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
            <div className="h-28 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
            <div className="h-96 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
        </div>
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
            <div className="h-96 bg-slate-200 dark:bg-white/5 rounded-2xl"></div>
        </div>
    </div>
);


const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isDarkMode = document.documentElement.classList.contains('dark');
  const chartTextColor = isDarkMode ? 'rgba(224, 224, 255, 0.8)' : 'rgba(22, 22, 51, 0.8)';
  const chartGridColor = isDarkMode ? 'rgba(126, 87, 255, 0.1)' : 'rgba(22, 22, 51, 0.05)';
  
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top' as const,
        labels: { color: chartTextColor, boxWidth: 12, padding: 20, font: { size: 12, family: 'Inter' } } 
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(10, 9, 39, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#E0E0FF' : '#10102A',
        bodyColor: isDarkMode ? '#A0A0C0' : '#5C5C7A',
        borderColor: isDarkMode ? 'rgba(126, 87, 255, 0.2)' : 'rgba(22, 22, 51, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        titleFont: { family: 'Sora' },
        bodyFont: { family: 'Inter' },
      }
    },
    scales: {
        x: { ticks: { color: chartTextColor, font: { size: 11, family: 'Inter' } }, grid: { color: chartGridColor }, border: { display: false } },
        y: { ticks: { color: chartTextColor, font: { size: 11, family: 'Inter' } }, grid: { color: chartGridColor }, border: { display: false } },
    }
  };
  
  const { data: items, isLoading: isLoadingItems } = useQuery<ItemDto[], Error>({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: movements, isLoading: isLoadingMovements } = useQuery<MovementDto[], Error>({
    queryKey: ['movements'],
    queryFn: fetchMovements,
    staleTime: 1 * 60 * 1000,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<UserDto[], Error>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: role === Role.RH,
  });

  const { data: myMovements, isLoading: isLoadingMyMovements } = useQuery<MovementDto[], Error>({
    queryKey: ['myEpiMovements', user?.id],
    queryFn: () => fetchUserEpiMovements(user!.id),
    enabled: !!user && role === Role.Colaborador,
    staleTime: 5 * 60 * 1000,
  });

  const handleQuickAction = (type: MovementType) => {
    navigate('/movements', { state: { openModal: type } });
  }

  const almoxarifeStats = React.useMemo(() => {
    if (!items || !movements) return { total: 0, expiring: 0, lowStock: 0, movesToday: 0 };
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return {
      total: items.length,
      expiring: items.filter(i => i.expirationDate && new Date(i.expirationDate) <= thirtyDaysFromNow && new Date(i.expirationDate) >= today).length,
      lowStock: items.filter(i => i.minStock && i.quantity < i.minStock).length,
      movesToday: movements.filter(m => new Date(m.date).toDateString() === today.toDateString()).length,
    }
  }, [items, movements]);

  const movementsByDayData = React.useMemo(() => {
    if (!movements) return null;
    const last30Days = [...Array(30)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'});
    });

    const data = last30Days.reduce((acc, date) => {
        acc[date] = { checkin: 0, checkout: 0 };
        return acc;
    }, {} as Record<string, { checkin: number, checkout: number }>);
    
    movements?.forEach(m => {
        const date = new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit'});
        if (data[date]) {
            if (m.type === MovementType.CHECKIN) data[date].checkin += m.quantity;
            else data[date].checkout += m.quantity;
        }
    });

    return {
        labels: Object.keys(data),
        datasets: [
            { label: 'Entradas', data: Object.values(data).map(d => d.checkin), backgroundColor: 'rgba(37, 200, 212, 0.1)', borderColor: '#25C8D4', pointBackgroundColor: '#25C8D4', tension: 0.4, fill: true },
            { label: 'Saídas', data: Object.values(data).map(d => d.checkout), backgroundColor: 'rgba(247, 37, 133, 0.1)', borderColor: '#F72585', pointBackgroundColor: '#F72585', tension: 0.4, fill: true }
        ]
    };
  }, [movements, isDarkMode]);

  const topMovedItemsData = React.useMemo(() => {
      if (!movements || !items) return null;
      const checkoutMovements = movements.filter(m => m.type === MovementType.CHECKOUT);
      const itemCounts = checkoutMovements.reduce((acc, mov) => {
          acc[mov.itemId] = (acc[mov.itemId] || 0) + mov.quantity;
          return acc;
      }, {} as Record<string, number>);

      const sortedItems = Object.entries(itemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([itemId, count]) => {
              const item = items.find(i => i.id === itemId);
              return { name: item?.name || 'Desconhecido', count };
          });

      return {
          labels: sortedItems.map(i => i.name),
          datasets: [{
              label: 'Quantidade Retirada',
              data: sortedItems.map(i => i.count),
              backgroundColor: isDarkMode ? 'rgba(126, 87, 255, 0.5)' : 'rgba(106, 68, 255, 0.7)',
              borderColor: '#7E57FF',
              borderWidth: 1,
              borderRadius: 6,
          }]
      };
  }, [movements, items, isDarkMode]);
  
  const itemStockStatusData = React.useMemo(() => {
    if (!items) return null;
    const stats = items.reduce((acc, item) => {
      if (item.quantity <= 0) acc.outOfStock++;
      else if (item.minStock && item.quantity < item.minStock) acc.lowStock++;
      else acc.inStock++;
      return acc;
    }, { inStock: 0, lowStock: 0, outOfStock: 0 });

    return {
      labels: ['Em Estoque', 'Estoque Baixo', 'Fora de Estoque'],
      datasets: [{
        data: [stats.inStock, stats.lowStock, stats.outOfStock],
        backgroundColor: ['#25C8D4', '#f59e0b', '#F72585'],
        borderColor: isDarkMode ? '#161633' : '#fff',
        borderWidth: 4,
        hoverOffset: 12,
      }]
    };
  }, [items, isDarkMode]);

  const epiComplianceData = React.useMemo(() => {
    if (!items) return null;
    const epiItems = items.filter(i => i.isEPI);
    const stats = epiItems.reduce((acc, item) => {
        const status = getEpiStatus(item);
        if (status === 'Vencido/Atrasado') acc.overdue += 1;
        else if (status === 'Vencimento Próximo') acc.dueSoon += 1;
        else acc.compliant += 1;
        return acc;
    }, { overdue: 0, dueSoon: 0, compliant: 0});

    return {
      labels: ['Em Conformidade', 'Vencimento Próximo', 'Vencido/Atrasado'],
      datasets: [{
          data: [stats.compliant, stats.dueSoon, stats.overdue],
          backgroundColor: ['#25C8D4', '#f59e0b', '#ef4444'],
          borderColor: isDarkMode ? '#161633' : '#fff',
          borderWidth: 4,
          hoverOffset: 12,
      }]
    };
  }, [items, isDarkMode]);

  const epiDistributionByCostCenterData = React.useMemo(() => {
    if (!movements || !users || !items) return null;
    
    const costCenterData = movements
        .filter(m => {
            const item = items.find(i => i.id === m.itemId);
            return m.type === MovementType.CHECKOUT && item?.isEPI && m.recipientId;
        })
        .reduce((acc, mov) => {
            const user = users.find(u => u.id === mov.recipientId);
            const costCenter = user?.costCenter || 'Não Especificado';
            acc[costCenter] = (acc[costCenter] || 0) + mov.quantity;
            return acc;
        }, {} as Record<string, number>);

    return {
        labels: Object.keys(costCenterData),
        datasets: [{
            label: 'Quantidade de EPIs',
            data: Object.values(costCenterData),
            backgroundColor: 'rgba(37, 200, 212, 0.6)',
            borderColor: '#25C8D4',
            borderWidth: 1,
            borderRadius: 6,
        }]
    };
}, [movements, users, items, isDarkMode]);


    const topEpiRecipients = React.useMemo(() => {
        if (!movements || !users || !items) return null;
        const epiCheckoutMovements = movements.filter(m => {
            const item = items.find(i => i.id === m.itemId);
            return m.type === MovementType.CHECKOUT && item?.isEPI && m.recipientId;
        });

        const userCounts = epiCheckoutMovements.reduce((acc, mov) => {
            acc[mov.recipientId!] = (acc[mov.recipientId!] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(userCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([userId, count]) => {
                const user = users.find(u => u.id === userId);
                return { name: user?.fullName || 'Desconhecido', count, userId };
            });
    }, [movements, users, items]);
    
    if(isLoadingItems || isLoadingMovements) {
        return (
            <div className="animate-fade-in-up">
                 <div className="mb-10">
                    <div className="h-10 w-3/5 bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse"></div>
                    <div className="h-6 w-4/5 bg-slate-200 dark:bg-white/5 rounded-lg mt-4 animate-pulse"></div>
                 </div>
                <DashboardSkeleton />
            </div>
        )
    }

  const renderAlmoxarifeDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Itens Totais" value={almoxarifeStats.total} isLoading={isLoadingItems} icon={<FiPackage className="h-6 w-6" />} />
        <StatCard title="Vencendo em 30 dias" value={almoxarifeStats.expiring} isLoading={isLoadingItems} icon={<FiClock className="h-6 w-6" />} />
        <StatCard title="Estoque Baixo" value={almoxarifeStats.lowStock} isLoading={isLoadingItems} icon={<FiAlertTriangle className="h-6 w-6" />} />
        <StatCard title="Movimentações Hoje" value={almoxarifeStats.movesToday} isLoading={isLoadingMovements} icon={<FiRepeat className="h-6 w-6" />} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
           <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-4">Movimentações (Últimos 30 dias)</h2>
           <div className="h-96">
             {movementsByDayData && <Line options={baseChartOptions as ChartOptions<'line'>} data={movementsByDayData} />}
           </div>
        </div>
        <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border flex flex-col">
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-5">Atividade Recente</h2>
            <ul className="space-y-3 flex-1 overflow-y-auto -mr-2 pr-2">
                {movements?.slice(0,10).map(m => (
                    <li key={m.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                        <div className={`p-2 rounded-full ${m.type === MovementType.CHECKIN ? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'}`}>
                            {m.type === MovementType.CHECKIN ? <FiPlusCircle/> : <FiMinusCircle/>}
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="font-medium text-light-text dark:text-dark-text">{m.item?.name}</p>
                            <p className="text-light-text-muted dark:text-dark-text-muted">{m.quantity} unidades por {m.user?.fullName.split(' ')[0]}</p>
                        </div>
                        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">{new Date(m.date).toLocaleDateString('pt-BR')}</p>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
         <div className="lg:col-span-3 bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-4">Top 5 Itens Mais Movimentados (Saídas)</h2>
            <div className="h-80">
                {topMovedItemsData && <Bar options={{...(baseChartOptions as ChartOptions<'bar'>), indexAxis: 'y' as const, scales: { ...baseChartOptions.scales, y: { ...baseChartOptions.scales.y, grid: { display: false }}}}} data={topMovedItemsData} />}
            </div>
        </div>
         <div className="lg:col-span-2 bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border flex flex-col">
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-4">Visão Geral do Estoque</h2>
            <div className="flex-grow h-80 flex items-center justify-center">
              {itemStockStatusData && <Pie options={{...baseChartOptions, plugins: { ...baseChartOptions.plugins, legend: { position: 'bottom' }}}} data={itemStockStatusData} />}
            </div>
          </div>
      </div>
    </div>
  );

  const renderRhDashboard = () => {
    const { scales, ...doughnutBaseOptions } = baseChartOptions;
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total de EPIs" value={items?.filter(i => i.isEPI).length ?? 0} isLoading={isLoadingItems} icon={<FiShield className="h-6 w-6" />} />
          <StatCard title="EPIs Vencendo" value={epiComplianceData?.datasets[0].data[1] ?? 0} isLoading={isLoadingItems} icon={<FiClock className="h-6 w-6" />} />
          <StatCard title="EPIs Vencidos" value={epiComplianceData?.datasets[0].data[2] ?? 0} isLoading={isLoadingItems} icon={<FiAlertTriangle className="h-6 w-6" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border flex flex-col">
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-4">Conformidade de EPIs</h2>
            <div className="flex-grow h-80 flex items-center justify-center">
              {epiComplianceData && <Doughnut options={{...doughnutBaseOptions, cutout: '60%', plugins: { ...doughnutBaseOptions.plugins, legend: { position: 'bottom' }}}} data={epiComplianceData} />}
            </div>
          </div>
          <div className="lg:col-span-3 bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
              <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-5">Distribuição de EPIs por Centro de Custo</h2>
              <div className="h-80">
                  {epiDistributionByCostCenterData && <Bar options={baseChartOptions as ChartOptions<'bar'>} data={epiDistributionByCostCenterData} />}
              </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                  <h3 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-4">Top 5 Colaboradores (Retiradas de EPI)</h3>
                  <ul className="space-y-3">
                    {topEpiRecipients?.map(r => (
                      <li key={r.userId} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <span className="font-medium text-light-text dark:text-dark-text">{r.name}</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-3 py-1 rounded-md">{r.count} retiradas</span>
                      </li>
                    ))}
                  </ul>
            </div>
             <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border border-light-border dark:border-dark-border">
              <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text mb-5">Ações Rápidas de RH</h2>
              <div className="space-y-4">
                <Link to="/reports" className="group w-full p-4 bg-light-surface dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-between transition-all duration-300 border border-light-border dark:border-dark-border">
                  <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-500/10 rounded-lg"><FiFileText className="h-8 w-8 text-primary-500"/></div>
                      <div className="text-left"><h3 className="font-bold text-light-text dark:text-dark-text">Gerar Relatórios</h3><p className="text-light-text-muted dark:text-dark-text-muted text-sm">Exportar dados de inventário.</p></div>
                  </div>
                  <FiArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary-500 transition-transform group-hover:translate-x-1"/>
                </Link>
                <Link to="/users" className="group w-full p-4 bg-light-surface dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center justify-between transition-all duration-300 border border-light-border dark:border-dark-border">
                  <div className="flex items-center space-x-4">
                      <div className="p-3 bg-secondary/10 rounded-lg"><FiUsers className="h-8 w-8 text-secondary"/></div>
                      <div className="text-left"><h3 className="font-bold text-light-text dark:text-dark-text">Gerenciar Colaboradores</h3><p className="text-light-text-muted dark:text-dark-text-muted text-sm">Ver histórico de EPIs.</p></div>
                  </div>
                  <FiArrowRight className="h-5 w-5 text-slate-400 group-hover:text-secondary transition-transform group-hover:translate-x-1"/>
                </Link>
              </div>
            </div>
        </div>
      </div>
    );
  };

    const renderColaboradorDashboard = () => {
        const myEpis = myMovements
            ?.filter(m => m.type === MovementType.CHECKOUT && m.item?.isEPI);

        const getStatus = (date: Date | undefined) => {
            if (!date) return { text: 'N/A', color: 'text-light-text-muted dark:text-dark-text-muted', raw: 'ok' };
            const today = new Date();
            today.setHours(0,0,0,0);
            const targetDate = new Date(date);
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(today.getDate() + 30);

            if (targetDate < today) return { text: 'Vencido', color: 'text-red-500 dark:text-red-400 font-semibold', raw: 'expired' };
            if (targetDate <= thirtyDaysFromNow) return { text: 'Vence em Breve', color: 'text-amber-500 dark:text-amber-400 font-semibold', raw: 'soon' };
            return { text: targetDate.toLocaleDateString('pt-BR'), color: 'text-light-text dark:text-dark-text', raw: 'ok' };
        }

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold font-heading text-light-text dark:text-dark-text">Meus Equipamentos (EPIs)</h2>
                        {!myEpis || myEpis.length === 0 ? (
                            <div className="bg-light-surface dark:bg-dark-surface p-8 rounded-2xl shadow-card text-center flex flex-col items-center animate-fade-in-up border border-light-border dark:border-dark-border">
                                <FiCheckCircle className="h-16 w-16 text-emerald-500 mb-4"/>
                                <h3 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Tudo em Ordem!</h3>
                                <p className="mt-2 text-light-text-muted dark:text-dark-text-muted max-w-md">
                                    Você não possui nenhum EPI retirado no momento.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               {myEpis.map(movement => {
                                   const returnStatus = getStatus(movement.expectedReturnDate);
                                   const expiryStatus = getStatus(movement.item?.expirationDate);
                                   const statusColorClass = (returnStatus.raw === 'expired' || expiryStatus.raw === 'expired') ? 'border-red-500/50' : (returnStatus.raw === 'soon' || expiryStatus.raw === 'soon') ? 'border-amber-500/50' : 'border-emerald-500/50';

                                   return (
                                       <div key={movement.id} className={`bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-card border-t-4 ${statusColorClass} border border-light-border dark:border-dark-border flex flex-col gap-4 animate-fade-in-up`}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-primary-500/10 rounded-lg">
                                                    <FiShield className="h-6 w-6 text-primary-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold font-heading text-light-text dark:text-dark-text">{movement.item?.name}</h3>
                                                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Retirado em {new Date(movement.date).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-light-border dark:border-dark-border my-2"></div>
                                            <ul className="space-y-3 text-sm">
                                                <li className="flex justify-between items-center">
                                                    <span className="text-light-text-muted dark:text-dark-text-muted">Devolução Esperada:</span>
                                                    <span className={returnStatus.color}>{returnStatus.text}</span>
                                                </li>
                                                <li className="flex justify-between items-center">
                                                    <span className="text-light-text-muted dark:text-dark-text-muted">Validade do Item:</span>
                                                    <span className={expiryStatus.color}>{expiryStatus.text}</span>
                                                </li>
                                            </ul>
                                       </div>
                                   )
                               })}
                            </div>
                        )}
                    </div>
                    <div className="bg-primary-500/10 dark:bg-primary-900/20 border-l-4 border-primary-500 p-6 rounded-2xl flex flex-col justify-center items-start space-y-3 h-fit mt-14">
                        <FiAlertTriangle className="h-8 w-8 text-primary-500"/>
                        <h3 className="text-lg font-bold font-heading text-light-text dark:text-dark-text">Lembrete de Segurança</h3>
                        <p className="text-light-text-muted dark:text-dark-text-muted text-sm">Inspecione seus EPIs antes de cada uso. Se encontrar qualquer dano, comunique seu supervisor imediatamente e solicite a troca.</p>
                    </div>
                </div>
            </div>
        )
    };

  const renderDashboardByRole = () => {
    switch(role) {
      case Role.Almoxarife: return renderAlmoxarifeDashboard();
      case Role.RH: return renderRhDashboard();
      case Role.Colaborador: return renderColaboradorDashboard();
      default: return renderColaboradorDashboard();
    }
  };

  const getSubtitle = () => {
    switch(role) {
        case Role.Almoxarife: return "Visão geral do inventário, atividades recentes e ações rápidas.";
        case Role.RH: return "Visão geral de conformidade de EPIs, custos e colaboradores.";
        case Role.Colaborador: return "Confira o status dos seus equipamentos de proteção individual.";
        default: return "Aqui está um resumo das suas atividades e itens.";
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-heading text-light-text dark:text-dark-text">Bem-vindo, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="mt-2 text-lg text-light-text-muted dark:text-dark-text-muted">{getSubtitle()}</p>
      </div>
      {renderDashboardByRole()}
    </div>
  );
};

export default DashboardPage;
