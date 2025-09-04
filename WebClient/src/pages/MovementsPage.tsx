import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { MovementDto, ItemDto, RegisterMovementRequestDto, MovementType, UserDto } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import { FiPlusCircle, FiMinusCircle, FiPlus, FiMinus, FiCamera, FiDownload, FiFileText } from 'react-icons/fi';
import Combobox from '../components/Combobox';
import SignaturePad, { SignaturePadHandle } from '../components/SignaturePad';
import QrScannerModal from '../components/QrScannerModal';
import { addToOfflineQueue } from '../services/offlineSync';
import { exportToCsv } from '../utils/export';

const fetchMovements = async (): Promise<MovementDto[]> => {
  const { data } = await api.get('/api/movements'); 
  return data.sort((a: MovementDto, b: MovementDto) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const fetchUsers = async (): Promise<UserDto[]> => {
  const { data } = await api.get('/api/users');
  return data;
};

const MovementsPage: React.FC = () => {
    const location = useLocation();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [movementType, setMovementType] = useState<MovementType>(MovementType.CHECKIN);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const signaturePadRef = useRef<SignaturePadHandle>(null);

    const { data: movements, isLoading: isLoadingMovements, isError: isErrorMovements, error: movementsError } = useQuery<MovementDto[], Error>({
        queryKey: ['movements'],
        queryFn: fetchMovements,
    });
    
    const { data: items, isLoading: isLoadingItems } = useQuery<ItemDto[], Error>({
        queryKey: ['items'],
        queryFn: fetchItems,
    });
    
    const { data: users, isLoading: isLoadingUsers } = useQuery<UserDto[], Error>({
        queryKey: ['users'],
        queryFn: fetchUsers,
        enabled: isModalOpen,
    });

    const { register, handleSubmit, reset, control, watch, setValue, getValues, formState: { errors } } = useForm<RegisterMovementRequestDto>({
        defaultValues: {
            itemId: '',
            quantity: 1,
        }
    });
    
    const selectedItemId = watch('itemId');
    const selectedItem = useMemo(() => items?.find(item => item.id === selectedItemId), [items, selectedItemId]);
    
    useEffect(() => {
        const state = location.state as { openModal?: MovementType };
        if (state?.openModal) {
            openModal(state.openModal);
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const movementMutation = useMutation({
        mutationFn: (data: { movementData: RegisterMovementRequestDto; type: MovementType }) => {
            const endpoint = data.type === MovementType.CHECKIN ? '/api/movements/checkin' : '/api/movements/checkout';
            return api.post(endpoint, data.movementData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements'] });
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setNotification({ message: `Movimentação registrada com sucesso!`, type: 'success' });
            closeModal();
        },
        onError: (err: any) => {
            // Offline handling
            if (!err.response) {
                const { movementData, type } = (err.config as any).mutationData;
                addToOfflineQueue(type, movementData);
                setNotification({ message: 'Sem conexão. A movimentação foi salva localmente e será sincronizada assim que a conexão for restaurada.', type: 'success' });
                closeModal();
            } else {
                setNotification({ message: err.response?.data?.message || 'Ocorreu um erro', type: 'error' });
            }
        }
    });

    const openModal = (type: MovementType) => {
        setMovementType(type);
        reset({ itemId: '', quantity: 1 });
        signaturePadRef.current?.clear();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = (data: RegisterMovementRequestDto) => {
        const isEpiCheckout = movementType === MovementType.CHECKOUT && selectedItem?.isEPI;
        let payload = { ...data };
        if (isEpiCheckout) {
            const signature = signaturePadRef.current?.getSignature();
            if (!signature) {
                 setNotification({ message: 'A assinatura do colaborador é obrigatória para a retirada de EPIs.', type: 'error' });
                 return;
            }
            payload = { ...data, digitalSignature: signature };
        }
        movementMutation.mutate({ movementData: payload, type: movementType }, {
            // Pass metadata to onError
            onSettled: (data, error: any, variables) => {
                if (error && !error.response) {
                    error.config.mutationData = variables;
                }
            }
        });
    };
    
    const handleQrScanSuccess = (decodedText: string) => {
        const foundItem = items?.find(item => item.id === decodedText);
        if (foundItem) {
            setValue('itemId', decodedText, { shouldValidate: true });
            setNotification({ message: `Item "${foundItem.name}" selecionado.`, type: 'success' });
        } else {
            setNotification({ message: 'Item não encontrado no inventário.', type: 'error' });
        }
        setIsScannerOpen(false);
    };

    const handleQuantityChange = (amount: number) => {
        const currentQuantity = getValues('quantity') || 0;
        const newQuantity = Math.max(1, currentQuantity + amount);
        setValue('quantity', newQuantity, { shouldValidate: true });
    };

    const handleExport = () => {
        const dataToExport = movements?.map(m => ({
            'Item': m.item?.name,
            'Tipo': m.type === 'CHECKIN' ? 'Entrada' : 'Saída',
            'Quantidade': m.quantity,
            'Operador': m.user?.fullName,
            'Recebedor': m.recipient?.fullName || '',
            'Data': new Date(m.date).toLocaleString('pt-BR'),
        }));
        if(dataToExport) {
            exportToCsv(dataToExport, 'relatorio_de_movimentacoes');
        }
    };

    const labelClasses = "block text-sm font-medium text-light-text-muted dark:text-dark-text-muted";
    const inputClasses = "mt-1 block w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition";

    return (
        <div className="animate-fade-in-up">
            {isScannerOpen && <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleQrScanSuccess}/>}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Movimentações de Estoque</h1>
                    <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Visualize o histórico de entradas e saídas de itens.</p>
                </div>
                <div className="flex space-x-3">
                    <button onClick={() => openModal(MovementType.CHECKIN)} className="flex-1 sm:flex-none flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <FiPlusCircle className="mr-2 h-5 w-5" /> Registrar Entrada
                    </button>
                    <button onClick={() => openModal(MovementType.CHECKOUT)} className="flex-1 sm:flex-none flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                        <FiMinusCircle className="mr-2 h-5 w-5" /> Registrar Saída
                    </button>
                </div>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border overflow-hidden">
                <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-end items-center">
                    <button
                        onClick={handleExport}
                        disabled={isLoadingMovements || !movements || movements.length === 0}
                        className="flex items-center bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface hover:bg-white/5 text-light-text-muted dark:text-dark-text-muted font-semibold py-2 px-4 rounded-lg shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FiFileText className="mr-2 h-4 w-4" />
                        Exportar
                    </button>
                </div>
                <div className="overflow-auto max-h-[calc(100vh-22rem)]">
                    <table className="w-full min-w-full">
                        <thead className="sticky top-0 bg-slate-50/75 dark:bg-dark-surface/80 backdrop-blur-sm z-10">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Item</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Quantidade</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Operador</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Recebedor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                            {isLoadingMovements ? (
                                <tr><td colSpan={6} className="py-16"><LoadingSpinner /></td></tr>
                            ) : isErrorMovements ? (
                                <tr><td colSpan={6} className="text-center py-16 text-red-500">Erro ao carregar movimentações: {movementsError.message}</td></tr>
                            ) : movements?.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-16 text-light-text-muted dark:text-dark-text-muted">Nenhuma movimentação registrada ainda.</td></tr>
                            ) : (
                                movements?.map(movement => (
                                    <tr key={movement.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{movement.item?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${movement.type === MovementType.CHECKIN ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                {movement.type === MovementType.CHECKIN ? 'Entrada' : 'Saída'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted text-right font-semibold">{movement.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{movement.user?.fullName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{movement.recipient?.fullName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-muted dark:text-dark-text-muted">{new Date(movement.date).toLocaleString('pt-BR')}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`Registrar ${movementType === MovementType.CHECKIN ? 'Entrada' : 'Saída'}`}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label htmlFor="itemId" className={labelClasses}>Item</label>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-grow">
                                <Controller
                                    name="itemId"
                                    control={control}
                                    rules={{ required: 'Por favor, selecione um item' }}
                                    render={({ field }) => (
                                        <Combobox
                                            items={items || []}
                                            value={field.value}
                                            onChange={field.onChange}
                                            isLoading={isLoadingItems}
                                            disabled={isLoadingItems}
                                        />
                                    )}
                                />
                            </div>
                            <button type="button" onClick={() => setIsScannerOpen(true)} className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-dark-surface/50 dark:hover:bg-white/10 rounded-lg transition-colors border border-light-border dark:border-dark-border shadow-sm" aria-label="Escanear QR Code">
                               <FiCamera className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted" />
                            </button>
                        </div>
                         {errors.itemId && <span className="text-red-500 text-xs mt-1">{errors.itemId.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="quantity" className={labelClasses}>Quantidade</label>
                        <div className="mt-1 flex items-center">
                            <button type="button" onClick={() => handleQuantityChange(-1)} className="p-3 border border-r-0 border-light-border dark:border-dark-border rounded-l-lg hover:bg-slate-100 dark:hover:bg-dark-surface/50 transition-colors">
                                <FiMinus className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
                            </button>
                             <input
                                id="quantity"
                                type="number"
                                {...register('quantity', { 
                                    required: 'A quantidade é obrigatória', 
                                    valueAsNumber: true, 
                                    min: { value: 1, message: "A quantidade deve ser de pelo menos 1" },
                                    validate: (value) => {
                                        if (movementType === MovementType.CHECKOUT && selectedItem) {
                                            return value <= selectedItem.quantity || `Quantidade excede o estoque atual (Estoque: ${selectedItem.quantity})`
                                        }
                                        return true;
                                    }
                                })}
                                className="w-full text-center px-2 py-2.5 bg-slate-100 dark:bg-dark-surface border-t border-b border-light-border dark:border-dark-border placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition"
                                style={{MozAppearance: 'textfield'}}
                            />
                            <button type="button" onClick={() => handleQuantityChange(1)} className="p-3 border border-l-0 border-light-border dark:border-dark-border rounded-r-lg hover:bg-slate-100 dark:hover:bg-dark-surface/50 transition-colors">
                                <FiPlus className="h-4 w-4 text-light-text-muted dark:text-dark-text-muted" />
                            </button>
                        </div>
                        {selectedItem && <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">Estoque atual: {selectedItem.quantity}</p>}
                         {errors.quantity && <span className="text-red-500 text-xs mt-1">{errors.quantity.message}</span>}
                    </div>

                    {movementType === MovementType.CHECKOUT && selectedItem?.isEPI && (
                        <div className="space-y-5 p-4 bg-slate-50 dark:bg-dark-surface/50 rounded-lg border border-light-border dark:border-dark-border">
                            <h4 className="font-semibold text-light-text dark:text-dark-text">Entrega de EPI</h4>
                            <div>
                                <label htmlFor="recipientId" className={labelClasses}>Colaborador (Recebedor)</label>
                                <Controller
                                    name="recipientId"
                                    control={control}
                                    rules={{ required: 'É necessário selecionar o colaborador' }}
                                    render={({ field }) => (
                                        <select {...field} disabled={isLoadingUsers} className={inputClasses}>
                                            <option value="">{isLoadingUsers ? 'Carregando...' : 'Selecione um colaborador'}</option>
                                            {users?.map(user => <option key={user.id} value={user.id}>{user.fullName}</option>)}
                                        </select>
                                    )}
                                />
                                {errors.recipientId && <span className="text-red-500 text-xs mt-1">{errors.recipientId.message}</span>}
                            </div>
                            <div>
                                <label className={labelClasses}>Assinatura do Colaborador</label>
                                <SignaturePad ref={signaturePadRef} />
                            </div>
                        </div>
                    )}

                     <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={closeModal} className="px-5 py-2 rounded-lg text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 font-semibold transition-colors">Cancelar</button>
                        <button type="submit" disabled={movementMutation.isPending} className="px-5 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center">
                            {movementMutation.isPending && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {movementMutation.isPending ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </Modal>

            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
};

export default MovementsPage;
