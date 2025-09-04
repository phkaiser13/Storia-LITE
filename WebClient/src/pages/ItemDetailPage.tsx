import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { ItemDto, MovementDto, MovementType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiChevronLeft, FiPackage, FiInfo, FiRepeat } from 'react-icons/fi';

const fetchItem = async (itemId: string): Promise<ItemDto> => {
  const { data } = await api.get(`/api/items/${itemId}`);
  return data;
};

const fetchItemMovements = async (itemId: string): Promise<MovementDto[]> => {
  const { data } = await api.get(`/api/movements/item/${itemId}`);
  return data.sort((a: MovementDto, b: MovementDto) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();

  const { data: item, isLoading: isLoadingItem, isError: isErrorItem } = useQuery<ItemDto, Error>({
    queryKey: ['item', itemId],
    queryFn: () => fetchItem(itemId!),
    enabled: !!itemId,
  });

  const { data: movements, isLoading: isLoadingMovements, isError: isErrorMovements } = useQuery<MovementDto[], Error>({
    queryKey: ['itemMovements', itemId],
    queryFn: () => fetchItemMovements(itemId!),
    enabled: !!itemId,
  });

  if (isLoadingItem) {
    return <div className="flex h-96 items-center justify-center"><LoadingSpinner /></div>;
  }
  
  if (isErrorItem || !item) {
      return <div className="text-center text-red-500">Item não encontrado ou erro ao carregar.</div>
  }

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">{label}</dt>
        <dd className="mt-1 text-sm text-light-text dark:text-dark-text font-semibold">{value || 'N/A'}</dd>
    </div>
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <Link to="/items" className="flex items-center text-sm font-semibold text-primary-600 hover:underline mb-4">
          <FiChevronLeft className="mr-1 h-4 w-4" />
          Voltar para Itens
        </Link>
        <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-100 dark:bg-dark-surface/50 rounded-full">
                <FiPackage className="h-8 w-8 text-light-text-muted dark:text-dark-text-muted" />
            </div>
            <div>
                 <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">{item.name}</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">{item.description}</p>
            </div>
        </div>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border">
        <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center gap-3">
             <FiInfo className="h-5 w-5 text-primary-500" />
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Detalhes do Item</h2>
        </div>
        <dl className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            <DetailItem label="Quantidade Atual" value={item.quantity} />
            <DetailItem label="Localização" value={item.location} />
            <DetailItem label="Estoque Mínimo" value={item.minStock} />
            <DetailItem label="Estoque Máximo" value={item.maxStock} />
            <DetailItem label="É EPI?" value={item.isEPI ? 'Sim' : 'Não'} />
            <DetailItem label="Data de Validade" value={item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A'} />
            <DetailItem label="Próxima Inspeção" value={item.nextInspectionDate ? new Date(item.nextInspectionDate).toLocaleDateString('pt-BR') : 'N/A'} />
            <DetailItem label="Última Movimentação" value={item.lastMovement ? new Date(item.lastMovement).toLocaleString('pt-BR') : 'Nenhuma'} />
        </dl>
      </div>
      
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
         <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center gap-3">
             <FiRepeat className="h-5 w-5 text-primary-500" />
            <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Histórico de Movimentações</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-slate-50 dark:bg-dark-surface/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Operador</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Recebedor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
               {isLoadingMovements ? (
                   <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
               ) : isErrorMovements ? (
                   <tr><td colSpan={5} className="text-center py-16 text-red-500">Erro ao carregar o histórico.</td></tr>
               ) : movements?.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhuma movimentação registrada para este item.</td></tr>
              ) : (
                movements?.map((movement) => (
                  <tr key={movement.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${movement.type === MovementType.CHECKIN ? 'bg-green-100 text-green-800 dark:bg-green-900/80 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200'}`}>
                           {movement.type === MovementType.CHECKIN ? 'Entrada' : 'Saída'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{movement.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{movement.user?.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{movement.recipient?.fullName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{new Date(movement.date).toLocaleString('pt-BR')}</td>
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

export default ItemDetailPage;
