import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Notification from '../components/Notification';
import { useAuth } from '../hooks/useAuth';
import { FiHelpCircle, FiSend } from 'react-icons/fi';

interface SupportFormData {
  subject: string;
  type: 'Feedback' | 'Bug' | 'Dúvida' | 'Outro';
  message: string;
  userEmail?: string;
  userName?: string;
  userRole?: string;
}

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/13399685/3byo351/";

const postToWebhook = (data: SupportFormData) => {
    return axios.post(ZAPIER_WEBHOOK_URL, data);
}

const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SupportFormData>();
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const mutation = useMutation({
        mutationFn: postToWebhook,
        onSuccess: () => {
            setNotification({ message: 'Sua mensagem foi enviada com sucesso! A equipe de suporte entrará em contato em breve.', type: 'success' });
            reset();
        },
        onError: () => {
            setNotification({ message: 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.', type: 'error' });
        }
    });

    const onSubmit = (data: SupportFormData) => {
        const payload = {
            ...data,
            userEmail: user?.email,
            userName: user?.fullName,
            userRole: user?.role,
        };
        mutation.mutate(payload);
    };

    const inputClasses = "mt-1 block w-full px-4 py-2.5 bg-slate-100 dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg shadow-sm placeholder-light-text-muted dark:placeholder-dark-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition";
    const labelClasses = "block text-sm font-medium text-light-text-muted dark:text-dark-text-muted";

    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-light-text dark:text-dark-text">Suporte e Feedback</h1>
                <p className="mt-1 text-light-text-muted dark:text-dark-text-muted">Encontrou um problema ou tem uma sugestão? Nos informe!</p>
            </div>

            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-card border border-light-border dark:border-dark-border">
                <div className="p-6 border-b border-light-border dark:border-dark-border flex items-center gap-3">
                    <FiHelpCircle className="h-5 w-5 text-primary-500" />
                    <h2 className="text-xl font-heading font-semibold text-light-text dark:text-dark-text">Formulário de Contato</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-w-2xl">
                    <div>
                        <label htmlFor="type" className={labelClasses}>Tipo de Solicitação</label>
                        <select
                            id="type"
                            {...register('type', { required: 'Selecione o tipo da solicitação' })}
                            className={`${inputClasses} ${errors.type ? 'border-red-500' : ''}`}
                        >
                            <option value="Feedback">Feedback</option>
                            <option value="Bug">Reportar um Bug</option>
                            <option value="Dúvida">Dúvida</option>
                            <option value="Outro">Outro</option>
                        </select>
                        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="subject" className={labelClasses}>Assunto</label>
                        <input
                            id="subject"
                            type="text"
                            {...register('subject', { required: 'O assunto é obrigatório' })}
                            className={`${inputClasses} ${errors.subject ? 'border-red-500' : ''}`}
                            placeholder="Ex: Erro ao registrar saída de item"
                        />
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="message" className={labelClasses}>Mensagem</label>
                        <textarea
                            id="message"
                            {...register('message', { required: 'A mensagem é obrigatória' })}
                            rows={6}
                            className={`${inputClasses} ${errors.message ? 'border-red-500' : ''}`}
                            placeholder="Descreva detalhadamente o seu problema ou sugestão aqui..."
                        />
                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed font-semibold transition-colors flex items-center"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <FiSend className="mr-2 h-5 w-5" />
                            )}
                            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                        </button>
                    </div>
                </form>
            </div>
            
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
};

export default SupportPage;
