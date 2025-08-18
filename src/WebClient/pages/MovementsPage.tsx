
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import api from '../services/api';
import { MovementDto, ItemDto, RegisterMovementRequestDto, MovementType } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import { FiPlusCircle, FiMinusCircle } from 'react-icons/fi';

const fetchMovements = async (): Promise<MovementDto[]> => {
  // Assuming an endpoint to get all movements, which is a common requirement for a history page.
  const { data } = await api.get('/api/movements'); 
  return data;
};

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const MovementsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [movementType, setMovementType] = useState<MovementType>(MovementType.CHECKIN);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const { data: movements, isLoading: isLoadingMovements, isError: isErrorMovements, error: movementsError } = useQuery<MovementDto[], Error>({
        queryKey: ['movements'],
        queryFn: fetchMovements,
    });
    
    const { data: items, isLoading: isLoadingItems } = useQuery<ItemDto[], Error>({
        queryKey: ['items'],
        queryFn: fetchItems,
    });

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RegisterMovementRequestDto>();

    const movementMutation = useMutation({
        mutationFn: (data: { movementData: RegisterMovementRequestDto; type: MovementType }) => {
            const endpoint = data.type === MovementType.CHECKIN ? '/api/movements/checkin' : '/api/movements/checkout';
            return api.post(endpoint, data.movementData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements'] });
            queryClient.invalidateQueries({ queryKey: ['items'] }); // Invalidate items too as quantity changes
            setNotification({ message: `Movement registered successfully!`, type: 'success' });
            closeModal();
        },
        onError: (err: any) => {
            setNotification({ message: err.response?.data?.message || 'An error occurred', type: 'error' });
        }
    });

    const openModal = (type: MovementType) => {
        setMovementType(type);
        reset({ itemId: '', quantity: 1 });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const onSubmit = (data: RegisterMovementRequestDto) => {
        movementMutation.mutate({ movementData: data, type: movementType });
    };

    const inputClasses = "mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Stock Movements</h1>
                <div className="flex space-x-3">
                    <button onClick={() => openModal(MovementType.CHECKIN)} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        <FiPlusCircle className="mr-2 h-5 w-5" /> Register Check-in
                    </button>
                    <button onClick={() => openModal(MovementType.CHECKOUT)} className="flex items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                        <FiMinusCircle className="mr-2 h-5 w-5" /> Register Check-out
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoadingMovements ? (
                                <tr><td colSpan={5} className="py-10"><LoadingSpinner /></td></tr>
                            ) : isErrorMovements ? (
                                <tr><td colSpan={5} className="text-center py-10 text-red-500">Error loading movements: {movementsError.message}</td></tr>
                            ) : movements?.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No movements recorded yet.</td></tr>
                            ) : (
                                movements?.map(movement => (
                                    <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{movement.item?.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${movement.type === MovementType.CHECKIN ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                {movement.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{movement.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{movement.user?.fullName || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(movement.date).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={`Register ${movementType === MovementType.CHECKIN ? 'Check-in' : 'Check-out'}`}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="itemId" className={labelClasses}>Item</label>
                        <Controller
                            name="itemId"
                            control={control}
                            rules={{ required: 'Please select an item' }}
                            render={({ field }) => (
                                <select id="itemId" {...field} className={inputClasses} disabled={isLoadingItems}>
                                    <option value="">{isLoadingItems ? 'Loading items...' : 'Select an item'}</option>
                                    {items?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                                </select>
                            )}
                        />
                         {errors.itemId && <span className="text-red-500 text-xs mt-1">{errors.itemId.message}</span>}
                    </div>
                    <div>
                        <label htmlFor="quantity" className={labelClasses}>Quantity</label>
                        <input
                            id="quantity"
                            type="number"
                            {...register('quantity', { required: 'Quantity is required', valueAsNumber: true, min: { value: 1, message: "Quantity must be at least 1" }})}
                            className={inputClasses}
                        />
                         {errors.quantity && <span className="text-red-500 text-xs mt-1">{errors.quantity.message}</span>}
                    </div>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                        <button type="submit" disabled={movementMutation.isPending} className="px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors">
                            {movementMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>

            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
};

export default MovementsPage;
