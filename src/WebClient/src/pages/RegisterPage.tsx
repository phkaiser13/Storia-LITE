
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { RegisterUserRequestDto, UserDto } from '../types';
import Notification from '../components/Notification';

const RegisterPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterUserRequestDto & { confirmPassword?: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const password = watch('password');

  const onSubmit = async (data: RegisterUserRequestDto) => {
    try {
      await api.post<UserDto>('/api/users', data);
      setNotification({ message: 'Cadastro realizado com sucesso! Redirecionando para o login...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'O cadastro falhou. Por favor, tente novamente.';
      setNotification({ message, type: 'error' });
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 transition-all duration-300";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-14" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Criar uma Conta</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-8">Junte-se ao StorIA-Lite hoje.</p>
        
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="fullName" className={labelClasses}>Nome Completo</label>
              <input id="fullName" type="text" {...register('fullName', { required: 'O nome completo é obrigatório' })} className={`${inputClasses} ${errors.fullName ? 'ring-2 ring-red-500' : ''}`} placeholder="John Doe" />
              {errors.fullName && <p className="text-red-500 text-xs mt-2">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>Endereço de E-mail</label>
              <input id="email" type="email" {...register('email', { required: 'O e-mail é obrigatório' })} className={`${inputClasses} ${errors.email ? 'ring-2 ring-red-500' : ''}`} placeholder="voce@exemplo.com" />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password"  className={labelClasses}>Senha</label>
              <input id="password" type="password" {...register('password', { required: 'A senha é obrigatória' })} className={`${inputClasses} ${errors.password ? 'ring-2 ring-red-500' : ''}`} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
            </div>
             <div>
              <label htmlFor="confirmPassword"  className={labelClasses}>Confirmar Senha</label>
              <input id="confirmPassword" type="password" {...register('confirmPassword', {  required: 'Por favor, confirme sua senha', validate: value => value === password || 'As senhas não correspondem' })} className={`${inputClasses} ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-2">{errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary-500/50 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Já possui uma conta?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default RegisterPage;