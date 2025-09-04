import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { UserDto, MovementDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiUser, FiChevronLeft, FiDownload } from 'react-icons/fi';
import { exportToCsv } from '../utils/export';

const fetchUser = async (userId: string): Promise<UserDto> => {
  const { data } = await api.get(`/api/users/${userId}`);
  return data;
};

const fetchUserEpiMovements = async (userId: string): Promise<MovementDto[]> => {
  const { data } = await api.get(`/api/movements/recipient/${userId}`);
  return data.sort((a: MovementDto, b: MovementDto) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const UserEpiHistoryPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const { data: user, isLoading: isLoadingUser } = useQuery<UserDto, Error>({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
  });

  const { data: movements, isLoading: isLoadingMovements } = useQuery<MovementDto[], Error>({
    queryKey: ['userEpiMovements', userId],
    queryFn: () => fetchUserEpiMovements(userId!),
    enabled: !!userId,
  });

  const handleExport = () => {
      if(movements && user) {
        const dataToExport = movements.map(m => ({
            'Colaborador': user.fullName,
            'EPI': m.item?.name,
            'Tipo': m.type === 'CHECKOUT' ? 'Entrega' : 'Devolução',
            'Data': new Date(m.date).toLocaleString('pt-BR'),
            'Operador': m.user?.fullName,
            'Assinatura Registrada': m.digitalSignature ? 'Sim' : 'Não',
        }));
        exportToCsv(dataToExport, `historico_epi_${user.fullName.replace(/\s/g, '_')}`);
      }
  }

  if (isLoadingUser || isLoadingMovements) {
    return <div className="flex h-96 items-center justify-center"><LoadingSpinner /></div>;
  }
  
  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <Link to="/users" className="flex items-center text-sm font-semibold text-primary-600 hover:underline mb-4">
          <FiChevronLeft className="mr-1 h-4 w-4" />
          Voltar para Colaboradores
        </Link>
        <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-dark-surface/50 rounded-full">
                <FiUser className="h-8 w-8 text-light-text-muted dark:text-dark-text-muted" />
            </div>
            <div>
                 <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">{user?.fullName}</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Histórico de entrega e devolução de Equipamentos de Proteção Individual.</p>
            </div>
        </div>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
         <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center">
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Registros de Movimentação</h2>
             <button
                onClick={handleExport}
                disabled={isLoadingMovements || !movements || movements.length === 0}
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">EPI</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Operador</th>
                 <th className="px-6 py-4 text-center text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Termo de Responsabilidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {movements?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhum EPI foi entregue a este colaborador.</td></tr>
              ) : (
                movements?.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{movement.item?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${movement.type === 'CHECKOUT' ? 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200'}`}>
                           {movement.type === 'CHECKOUT' ? 'Entrega' : 'Devolução'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{new Date(movement.date).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{movement.user?.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        {movement.digitalSignature ? (
                             <button className="inline-flex items-center text-sm font-semibold text-primary-600 hover:underline">
                                <FiDownload className="mr-1.5 h-4 w-4"/>
                                Ver Assinatura
                            </button>
                        ): (
                            <span className="text-sm text-light-text-muted dark:text-dark-text-muted">N/A</span>
                        )}
                    </td>
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

export default UserEpiHistoryPage;
