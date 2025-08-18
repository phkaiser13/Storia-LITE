
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/StatCard';
import { FiPackage, FiAlertTriangle, FiUserCheck, FiArrowRight, FiPlusCircle, FiMinusCircle, FiFileText, FiBarChart2, FiUsers } from 'react-icons/fi';
import api from '../services/api';
import { ItemDto, Role, MovementDto, MovementType } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const fetchMovements = async (): Promise<MovementDto[]> => {
    const { data } = await api.get('/api/movements');
    return data.sort((a: MovementDto, b: MovementDto) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: items, isLoading: isLoadingItems } = useQuery<ItemDto[], Error>({
    queryKey: ['items'],
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: movements, isLoading: isLoadingMovements } = useQuery<MovementDto[], Error>({
    queryKey: ['movements'],
    queryFn: fetchMovements,
    staleTime: 1 * 60 * 1000,
    enabled: user?.role === Role.Almoxarife,
  });

  const expiringSoonCount = items?.filter(item => {
    if (!item.expirationDate) return false;
    const expiration = new Date(item.expirationDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiration > today && expiration <= thirtyDaysFromNow;
  }).length ?? 0;

  const handleQuickAction = (type: MovementType) => {
    navigate('/movements', { state: { openModal: type } });
  }

  const renderStatCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-in">
      <StatCard 
        title="Itens Totais" 
        value={items?.length ?? 0}
        isLoading={isLoadingItems}
        icon={<FiPackage className="h-7 w-7 text-primary-600 dark:text-primary-300" />} 
      />
      <StatCard 
        title="Vencendo em Breve" 
        value={expiringSoonCount}
        isLoading={isLoadingItems}
        icon={<FiAlertTriangle className="h-7 w-7 text-yellow-500 dark:text-yellow-400" />} 
      />
      <StatCard 
        title="Sua Função" 
        value={user?.role ?? 'N/A'}
        icon={<FiUserCheck className="h-7 w-7 text-green-500 dark:text-green-400" />} 
      />
    </div>
  );
  
  const renderAlmoxarifeDashboard = () => (
    <>
      {renderStatCards()}
      <div className="mt-10 animate-slide-in" style={{animationDelay: '100ms'}}>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button onClick={() => handleQuickAction(MovementType.CHECKIN)} className="p-6 bg-green-50 dark:bg-green-900/40 rounded-2xl flex items-center space-x-4 hover:bg-green-100 dark:hover:bg-green-900/60 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg border border-green-200 dark:border-green-800">
            <FiPlusCircle className="h-10 w-10 text-green-500"/>
            <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Registrar Entrada</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Adicionar itens recebidos ao estoque.</p>
            </div>
          </button>
           <button onClick={() => handleQuickAction(MovementType.CHECKOUT)} className="p-6 bg-red-50 dark:bg-red-900/40 rounded-2xl flex items-center space-x-4 hover:bg-red-100 dark:hover:bg-red-900/60 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg border border-red-200 dark:border-red-800">
            <FiMinusCircle className="h-10 w-10 text-red-500"/>
            <div className="text-left">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Registrar Saída</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Registrar itens que saem do estoque.</p>
            </div>
          </button>
        </div>
      </div>
      <div className="mt-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg animate-slide-in" style={{animationDelay: '200ms'}}>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Movimentações Recentes</h2>
        <div className="overflow-x-auto">
            {isLoadingMovements ? <div className="h-48 flex justify-center items-center"><LoadingSpinner /></div> : (
                <table className="w-full text-left">
                    <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="py-2 px-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Item</th>
                            <th className="py-2 px-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Tipo</th>
                            <th className="py-2 px-3 text-sm font-semibold text-gray-600 dark:text-gray-400">Qtd.</th>
                            <th className="py-2 px-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">Usuário</th>
                            <th className="py-2 px-3 text-sm font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movements && movements.length > 0 ? movements.slice(0,5).map(m => (
                            <tr key={m.id} className="border-b border-gray-100 dark:border-gray-700/50">
                                <td className="py-3 px-3 text-sm font-medium text-gray-800 dark:text-gray-200">{m.item?.name}</td>
                                <td className="py-3 px-3">
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${m.type === MovementType.CHECKIN ? 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200'}`}>
                                        {m.type === MovementType.CHECKIN ? 'Entrada' : 'Saída'}
                                    </span>
                                </td>
                                <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-300">{m.quantity}</td>
                                <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">{m.user?.fullName?.split(' ')[0]}</td>
                                <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma movimentação recente.</td></tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
      </div>
    </>
  );

  const renderRhDashboard = () => (
    <>
      {renderStatCards()}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-in" style={{animationDelay: '100ms'}}>
        <Link to="/reports" className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all duration-300 flex flex-col justify-between border dark:border-gray-700">
            <div>
                <FiFileText className="h-10 w-10 text-primary-500 mb-4"/>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gerar Relatórios</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Visualize e exporte relatórios, como itens próximos da data de vencimento.</p>
            </div>
            <div className="mt-4 text-primary-600 dark:text-primary-400 font-semibold flex items-center group-hover:underline">
                Ver Relatórios <FiArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
        </Link>
        <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col justify-between opacity-70 border dark:border-gray-700">
            <div>
                <FiBarChart2 className="h-10 w-10 text-gray-500 mb-4"/>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Análise de Movimentação</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Análises avançadas sobre saídas de itens e tendências.</p>
            </div>
            <div className="mt-4 text-gray-500 font-semibold">
                Em Breve
            </div>
        </div>
      </div>
    </>
  );

  const renderColaboradorDashboard = () => (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center flex flex-col items-center animate-slide-in">
        <FiUsers className="h-16 w-16 text-primary-500 mb-4"/>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Bem-vindo ao StorIA-Lite</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
            Seu acesso é limitado. Entre em contato com o RH ou seu gerente se acreditar que precisa de permissões adicionais.
        </p>
    </div>
  );

  const renderDashboardByRole = () => {
    switch(user?.role) {
      case Role.Almoxarife: return renderAlmoxarifeDashboard();
      case Role.RH: return renderRhDashboard();
      case Role.Colaborador: return renderColaboradorDashboard();
      default: return renderColaboradorDashboard();
    }
  };

  const getSubtitle = () => {
    switch(user?.role) {
        case Role.Almoxarife: return "Aqui está um resumo da atividade recente e ações rápidas.";
        case Role.RH: return "Aqui está uma visão geral dos relatórios e análises de inventário.";
        case Role.Colaborador: return "Bem-vindo ao sistema de gerenciamento de inventário da empresa.";
        default: return "Aqui está um resumo do seu inventário hoje.";
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 animate-slide-in">Bem-vindo, {user?.fullName?.split(' ')[0]}!</h1>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 animate-slide-in" style={{animationDelay: '50ms'}}>{getSubtitle()}</p>
      </div>
      {renderDashboardByRole()}
    </div>
  );
};

export default DashboardPage;
