import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { ChangePasswordRequestDto } from '../types';
import Notification from '../components/Notification';
import { useAuth } from '../hooks/useAuth';
import { FiKey } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm<ChangePasswordRequestDto & { confirmNewPassword?: string }>();
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const newPassword = watch('newPassword');
    
    const changePasswordMutation = useMutation({
        mutationFn: (data: ChangePasswordRequestDto) => api.post('/api/auth/change-password', data),
        onSuccess: () => {
            setNotification({ message: 'Senha alterada com sucesso!', type: 'success' });
            reset();
        },
        onError: (err: any) => {
            setNotification({ message: err.response?.data?.message || 'Falha ao alterar a senha.', type: 'error' });
        }
    });

    const onSubmit = (data: ChangePasswordRequestDto) => {
        changePasswordMutation.mutate(data);
    };
    
    const inputClasses = "mt-1 block w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition";
    const labelClasses = "block text-sm font-medium text-light-text-muted dark:text-dark-text-muted";

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Configurações da Conta</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Gerencie suas informações pessoais e configurações de segurança.</p>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center gap-3">
                    <FiKey className="h-5 w-5 text-primary-500"/>
                    <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Alterar Senha</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-w-lg">
                     <div>
                        <label htmlFor="currentPassword" className={labelClasses}>Senha Atual</label>
                        <input
                            id="currentPassword"
                            type="password"
                            {...register('currentPassword', { required: 'A senha atual é obrigatória' })}
                            className={`${inputClasses} ${errors.currentPassword ? 'border-red-500' : ''}`}
                            autoComplete="current-password"
                        />
                        {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="newPassword" className={labelClasses}>Nova Senha</label>
                        <input
                            id="newPassword"
                            type="password"
                            {...register('newPassword', { required: 'A nova senha é obrigatória', minLength: { value: 6, message: 'A senha deve ter no mínimo 6 caracteres' }})}
                            className={`${inputClasses} ${errors.newPassword ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                    </div>
                     <div>
                        <label htmlFor="confirmNewPassword" className={labelClasses}>Confirmar Nova Senha</label>
                        <input
                            id="confirmNewPassword"
                            type="password"
                            {...register('confirmNewPassword', { required: 'Confirme a nova senha', validate: value => value === newPassword || 'As senhas não correspondem' })}
                            className={`${inputClasses} ${errors.confirmNewPassword ? 'border-red-500' : ''}`}
                            autoComplete="new-password"
                        />
                        {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword.message}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center"
                        >
                            {isSubmitting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isSubmitting ? 'Salvando...' : 'Salvar Nova Senha'}
                        </button>
                    </div>
                </form>
            </div>
            
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
};

export default SettingsPage;
