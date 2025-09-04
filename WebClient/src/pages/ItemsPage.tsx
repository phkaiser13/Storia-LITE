import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ItemDto, CreateItemRequestDto, UpdateItemRequestDto } from '../types';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import { FiPlus, FiEdit, FiTrash2, FiUploadCloud, FiDownload, FiAlertTriangle, FiFileText } from 'react-icons/fi';
import { exportToCsv } from '../utils/export';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const ItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [epiStatusFilter, setEpiStatusFilter] = useState<'all' | 'epi' | 'regular'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');

  const { data: items, isLoading, isError, error } = useQuery<ItemDto[], Error>({
    queryKey: ['items'],
    queryFn: fetchItems
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CreateItemRequestDto>();
  const isEPI = watch('isEPI');
  const requiresMaintenance = watch('requiresMaintenance');

  const filteredItems = useMemo(() => {
    return items
      ?.filter(item => {
        if (!searchTerm) return true;
        return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               item.description.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .filter(item => {
        if (epiStatusFilter === 'all') return true;
        if (epiStatusFilter === 'epi') return item.isEPI;
        if (epiStatusFilter === 'regular') return !item.isEPI;
        return true;
      })
      .filter(item => {
        if (stockStatusFilter === 'all') return true;
        if (stockStatusFilter === 'in_stock') return item.quantity > 0 && !(item.minStock && item.quantity < item.minStock);
        if (stockStatusFilter === 'out_of_stock') return item.quantity <= 0;
        if (stockStatusFilter === 'low_stock') return item.minStock && item.quantity > 0 && item.quantity < item.minStock;
        return true;
      });
  }, [items, searchTerm, epiStatusFilter, stockStatusFilter]);
  
  const handleExport = () => {
    if (filteredItems) {
      const dataToExport = filteredItems.map(item => ({
        'ID': item.id,
        'Nome': item.name,
        'Descrição': item.description,
        'Quantidade': item.quantity,
        'Estoque Mínimo': item.minStock ?? 'N/A',
        'Estoque Máximo': item.maxStock ?? 'N/A',
        'Localização': item.location,
        'É EPI?': item.isEPI ? 'Sim' : 'Não',
        'Data de Validade': item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A',
        'Próxima Inspeção': item.nextInspectionDate ? new Date(item.nextInspectionDate).toLocaleDateString('pt-BR') : 'N/A',
        'Requer Manutenção': item.requiresMaintenance ? 'Sim' : 'Não',
        'Próxima Manutenção': item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString('pt-BR') : 'N/A',
      }));
      exportToCsv(dataToExport, 'relatorio_de_itens');
    }
  };

  const mutation = useMutation({
    mutationFn: (newItem: CreateItemRequestDto | UpdateItemRequestDto) => {
      if (editingItem) {
        return api.put(`/api/items/${editingItem.id}`, newItem);
      }
      return api.post('/api/items', newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setNotification({ message: `Item ${editingItem ? 'atualizado' : 'criado'} com sucesso!`, type: 'success' });
      closeModal();
    },
    onError: (err: any) => {
      setNotification({ message: err.response?.data?.message || 'Ocorreu um erro', type: 'error' });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/items/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setNotification({ message: 'Item excluído com sucesso', type: 'success' });
    },
    onError: (err: any) => {
        setNotification({ message: err.response?.data?.message || 'Falha ao excluir o item', type: 'error' });
    }
  });

  const openModal = (item: ItemDto | null = null) => {
    setEditingItem(item);
    if (item) {
        reset(item as any); // Reset with all item fields
        if (item.expirationDate) setValue('expirationDate', new Date(item.expirationDate).toISOString().split('T')[0] as any);
        if (item.nextInspectionDate) setValue('nextInspectionDate', new Date(item.nextInspectionDate).toISOString().split('T')[0] as any);
        if (item.nextMaintenanceDate) setValue('nextMaintenanceDate', new Date(item.nextMaintenanceDate).toISOString().split('T')[0] as any);
    } else {
        reset({ name: '', description: '', quantity: 0, location: '', expirationDate: undefined, isEPI: false, nextInspectionDate: undefined, minStock: 0, maxStock: 0, requiresMaintenance: false, nextMaintenanceDate: undefined });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
  };
  
  const onSubmit = (data: CreateItemRequestDto) => {
    mutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Você tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.')) {
        deleteMutation.mutate(id);
    }
  }

  const inputClasses = "mt-1 block w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition";
  const labelClasses = "block text-sm font-medium text-light-text-muted dark:text-dark-text-muted";

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Gerenciar Itens e EPIs</h1>
            <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Adicione, edite ou remova itens e EPIs do seu inventário.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Adicionar Novo Item
        </button>
      </div>

      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
                type="text"
                placeholder="Pesquisar por nome ou descrição..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="md:col-span-2 block w-full px-4 py-2 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
            <select value={epiStatusFilter} onChange={e => setEpiStatusFilter(e.target.value as any)} className="block w-full px-4 py-2 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                <option value="all">Todos os Tipos</option>
                <option value="epi">Apenas EPIs</option>
                <option value="regular">Itens Comuns</option>
            </select>
            <select value={stockStatusFilter} onChange={e => setStockStatusFilter(e.target.value as any)} className="block w-full px-4 py-2 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                <option value="all">Todos os Status</option>
                <option value="in_stock">Em Estoque</option>
                <option value="low_stock">Estoque Baixo</option>
                <option value="out_of_stock">Fora de Estoque</option>
            </select>
        </div>
      </div>
      
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center">
            <h3 className="font-semibold text-light-text-muted dark:text-dark-text-muted">
                Exibindo {filteredItems?.length || 0} de {items?.length || 0} itens
            </h3>
            <button
                onClick={handleExport}
                disabled={isLoading || !filteredItems || filteredItems.length === 0}
                className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FiFileText className="mr-2 h-4 w-4" />
                Exportar
            </button>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-26rem)]">
            <table className="w-full min-w-full">
              <thead className="sticky top-0 bg-slate-50/75 dark:bg-dark-surface/75 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Localização</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Data de Validade</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {isLoading ? (
                  <tr><td colSpan={5} className="py-16"><LoadingSpinner /></td></tr>
                ) : isError ? (
                  <tr><td colSpan={5} className="text-center py-16 text-red-500">Erro ao carregar itens: {error.message}</td></tr>
                ) : filteredItems?.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhum item corresponde aos filtros.</td></tr>
                ) : (
                  filteredItems?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/items/${item.id}`} className="group block">
                            <div className="text-sm font-semibold text-light-text dark:text-dark-text group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {item.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {item.isEPI && <span className="text-xs font-medium bg-secondary/10 text-secondary dark:bg-secondary/20 px-2 py-0.5 rounded-full">EPI</span>}
                              <div className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-xs truncate">{item.description}</div>
                            </div>
                          </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                           <span className={`${(item.minStock && item.quantity < item.minStock) ? 'text-red-500 dark:text-red-400 font-bold' : 'text-light-text dark:text-dark-text'}`}>{item.quantity}</span>
                            {item.minStock && item.quantity < item.minStock && (
                                <div className="group relative">
                                    <FiAlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                                    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-max opacity-0 transition-opacity group-hover:opacity-100 px-2 py-1 text-xs text-white bg-slate-700 rounded-md shadow-lg">
                                        Estoque abaixo do mínimo ({item.minStock})
                                    </span>
                                </div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('pt-BR') : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => openModal(item)} className="p-2 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition"><FiEdit className="h-5 w-5" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-200/50 dark:hover:bg-white/10 transition"><FiTrash2 className="h-5 w-5" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Editar Item' : 'Adicionar Novo Item'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label htmlFor="name" className={labelClasses}>Nome</label>
                <input id="name" {...register('name', { required: 'O nome é obrigatório' })} className={inputClasses} />
                {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>
            <div>
                <label htmlFor="description" className={labelClasses}>Descrição</label>
                <textarea id="description" {...register('description')} className={inputClasses} rows={2} />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {!editingItem && (
                    <div className="sm:col-span-1">
                        <label htmlFor="quantity" className={labelClasses}>Qtd. Inicial</label>
                        <input id="quantity" type="number" {...register('quantity', { required: 'A quantidade é obrigatória', valueAsNumber: true, min: { value: 0, message: "A quantidade não pode ser negativa" } })} className={inputClasses} />
                        {errors.quantity && <span className="text-red-500 text-xs mt-1">{errors.quantity.message}</span>}
                    </div>
                )}
                <div className="sm:col-span-1">
                    <label htmlFor="minStock" className={labelClasses}>Estoque Mín.</label>
                    <input id="minStock" type="number" {...register('minStock', { valueAsNumber: true, min: { value: 0, message: "Valor inválido" } })} className={inputClasses} placeholder="Ex: 10" />
                </div>
                <div className="sm:col-span-1">
                    <label htmlFor="maxStock" className={labelClasses}>Estoque Máx.</label>
                    <input id="maxStock" type="number" {...register('maxStock', { valueAsNumber: true, min: { value: 0, message: "Valor inválido" } })} className={inputClasses} placeholder="Ex: 50" />
                </div>
            </div>
            <div>
                <label htmlFor="location" className={labelClasses}>Localização</label>
                <input id="location" {...register('location', { required: 'A localização é obrigatória' })} className={inputClasses} />
                 {errors.location && <span className="text-red-500 text-xs mt-1">{errors.location.message}</span>}
            </div>
            <div>
                <label htmlFor="expirationDate" className={labelClasses}>Data de Validade (Opcional)</label>
                <input id="expirationDate" type="date" {...register('expirationDate', { valueAsDate: true })} className={inputClasses} />
            </div>

            <div className="pt-2 space-y-4">
              <div className="flex items-center">
                <input id="isEPI" type="checkbox" {...register('isEPI')} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="isEPI" className="ml-2 block text-sm text-light-text dark:text-dark-text font-medium">Este item é um EPI</label>
              </div>
               <div className="flex items-center">
                <input id="requiresMaintenance" type="checkbox" {...register('requiresMaintenance')} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="requiresMaintenance" className="ml-2 block text-sm text-light-text dark:text-dark-text font-medium">Requer Manutenção Periódica</label>
              </div>
            </div>

            {isEPI && (
              <div className="space-y-5 p-4 bg-slate-50 dark:bg-dark-surface/50 rounded-lg border border-light-border dark:border-dark-border">
                <h4 className="font-semibold text-light-text dark:text-dark-text">Informações do EPI</h4>
                <div>
                  <label htmlFor="nextInspectionDate" className={labelClasses}>Próxima Inspeção (Opcional)</label>
                  <input id="nextInspectionDate" type="date" {...register('nextInspectionDate', { valueAsDate: true })} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Certificados (CA, laudos)</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-light-border dark:border-dark-border border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <FiUploadCloud className="mx-auto h-10 w-10 text-slate-400" />
                      <div className="flex text-sm text-slate-600 dark:text-slate-300"><p>Funcionalidade em desenvolvimento.</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {requiresMaintenance && (
                 <div className="space-y-5 p-4 bg-slate-50 dark:bg-dark-surface/50 rounded-lg border border-light-border dark:border-dark-border">
                    <h4 className="font-semibold text-light-text dark:text-dark-text">Agendamento de Manutenção</h4>
                    <div>
                        <label htmlFor="nextMaintenanceDate" className={labelClasses}>Próxima Data de Manutenção</label>
                        <input id="nextMaintenanceDate" type="date" {...register('nextMaintenanceDate', { valueAsDate: true })} className={inputClasses} />
                    </div>
                 </div>
            )}


            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 font-semibold transition-colors">Cancelar</button>
                <button type="submit" disabled={mutation.isPending} className="px-5 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center">{mutation.isPending && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2-24" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}{mutation.isPending ? 'Salvando...' : 'Salvar'}</button>
            </div>
        </form>
      </Modal>

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default ItemsPage;