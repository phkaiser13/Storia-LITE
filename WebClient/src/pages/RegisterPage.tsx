import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { RegisterUserRequestDto, UserDto } from '../types';
import Notification from '../components/Notification';
import { FiUserPlus } from 'react-icons/fi';

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

  const inputClasses = "mt-1 block w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300";
  const labelClasses = "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <div className="w-full max-w-5xl mx-auto lg:grid lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800 animate-fade-in-up">
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-slate-900 text-white relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
            <div className="absolute inset-0 bg-grid-slate-900 [mask-image:linear-gradient(to_bottom,transparent,white,transparent)]"></div>
            <div className="relative z-10 flex flex-col items-center">
                <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-20 mb-6 bg-white/10 p-3 rounded-2xl" />
                <h1 className="font-heading text-3xl font-bold text-center">Junte-se a Nós</h1>
                <p className="text-center text-slate-400 mt-4 max-w-sm">Crie sua conta para começar a otimizar a gestão do seu inventário de forma eficiente e inteligente.</p>
            </div>
        </div>

        <div className="p-8 sm:p-16 flex flex-col justify-center">
          <div className="flex justify-center mb-6 lg:hidden">
            <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-14" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-center text-slate-800 dark:text-white">Criar uma Conta</h1>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-2 mb-8">Junte-se ao StorIA-Lite hoje.</p>
        
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="fullName" className={labelClasses}>Nome Completo</label>
              <input id="fullName" type="text" {...register('fullName', { required: 'O nome completo é obrigatório' })} className={`${inputClasses} ${errors.fullName ? 'border-red-500 ring-red-500' : ''}`} placeholder="John Doe" />
              {errors.fullName && <p className="text-red-500 text-xs mt-2">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>Endereço de E-mail</label>
              <input id="email" type="email" {...register('email', { required: 'O e-mail é obrigatório' })} className={`${inputClasses} ${errors.email ? 'border-red-500 ring-red-500' : ''}`} placeholder="voce@exemplo.com" />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password"  className={labelClasses}>Senha</label>
              <input id="password" type="password" {...register('password', { required: 'A senha é obrigatória' })} className={`${inputClasses} ${errors.password ? 'border-red-500 ring-red-500' : ''}`} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
            </div>
             <div>
              <label htmlFor="confirmPassword"  className={labelClasses}>Confirmar Senha</label>
              <input id="confirmPassword" type="password" {...register('confirmPassword', {  required: 'Por favor, confirme sua senha', validate: value => value === password || 'As senhas não correspondem' })} className={`${inputClasses} ${errors.confirmPassword ? 'border-red-500 ring-red-500' : ''}`} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-2">{errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FiUserPlus className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Criando conta...' : 'Cadastrar'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
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