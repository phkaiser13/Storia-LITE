import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { ItemDto, CreateItemRequestDto, UpdateItemRequestDto } from '../types';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';
import Modal from '../components/Modal';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const fetchItems = async (): Promise<ItemDto[]> => {
  const { data } = await api.get('/api/items');
  return data;
};

const ItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data: items, isLoading, isError, error } = useQuery<ItemDto[], Error>({
    queryKey: ['items'],
    queryFn: fetchItems
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateItemRequestDto>();

  const mutation = useMutation({
    mutationFn: (newItem: CreateItemRequestDto | UpdateItemRequestDto) => {
      if (editingItem) {
        return api.put(`/api/items/${editingItem.id}`, newItem);
      }
      return api.post('/api/items', newItem);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setNotification({ message: `Item ${editingItem ? 'updated' : 'created'} successfully!`, type: 'success' });
      closeModal();
    },
    onError: (err: any) => {
      setNotification({ message: err.response?.data?.message || 'An error occurred', type: 'error' });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/items/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        setNotification({ message: 'Item deleted successfully', type: 'success' });
    },
    onError: (err: any) => {
        setNotification({ message: err.response?.data?.message || 'Failed to delete item', type: 'error' });
    }
  });

  const openModal = (item: ItemDto | null = null) => {
    setEditingItem(item);
    if (item) {
        const defaultValues: CreateItemRequestDto = {
            ...item,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
        };
        reset(defaultValues);
        if (item.expirationDate) {
            setValue('expirationDate', new Date(item.expirationDate).toISOString().split('T')[0] as any);
        }
    } else {
        reset({ name: '', description: '', quantity: 0, location: '', expirationDate: undefined });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    reset();
  };
  
  const onSubmit = (data: CreateItemRequestDto) => {
    if (editingItem) {
        const updateData: UpdateItemRequestDto = {
            name: data.name,
            description: data.description,
            location: data.location,
            expirationDate: data.expirationDate,
        };
        mutation.mutate(updateData);
    } else {
        mutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        deleteMutation.mutate(id);
    }
  }

  if (isLoading) return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
  if (isError) return <div className="text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">Error: {error.message}</div>;

  const inputClasses = "mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Manage Items</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Add New Item
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Expiration Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {items?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No items found.</td>
                  </tr>
                )}
                {items?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button onClick={() => openModal(item)} className="p-2 text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200 rounded-full hover:bg-primary-100 dark:hover:bg-gray-700 transition"><FiEdit className="h-5 w-5" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition"><FiTrash2 className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingItem ? 'Edit Item' : 'Add New Item'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="name" className={labelClasses}>Name</label>
                <input id="name" {...register('name', { required: 'Name is required' })} className={inputClasses} />
                {errors.name && <span className="text-red-500 text-xs mt-1">{errors.name.message}</span>}
            </div>
            <div>
                <label htmlFor="description" className={labelClasses}>Description</label>
                <textarea id="description" {...register('description')} className={inputClasses} rows={3} />
            </div>
            {!editingItem && (
                 <div>
                    <label htmlFor="quantity" className={labelClasses}>Quantity</label>
                    <input id="quantity" type="number" {...register('quantity', { required: 'Quantity is required', valueAsNumber: true, min: { value: 0, message: "Quantity can't be negative" } })} className={inputClasses} />
                    {errors.quantity && <span className="text-red-500 text-xs mt-1">{errors.quantity.message}</span>}
                </div>
            )}
            <div>
                <label htmlFor="location" className={labelClasses}>Location</label>
                <input id="location" {...register('location', { required: 'Location is required' })} className={inputClasses} />
                 {errors.location && <span className="text-red-500 text-xs mt-1">{errors.location.message}</span>}
            </div>
            <div>
                <label htmlFor="expirationDate" className={labelClasses}>Expiration Date (Optional)</label>
                <input id="expirationDate" type="date" {...register('expirationDate', { valueAsDate: true })} className={inputClasses} />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" disabled={mutation.isPending} className="px-4 py-2 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors">{mutation.isPending ? 'Saving...' : 'Save'}</button>
            </div>
        </form>
      </Modal>

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default ItemsPage;
