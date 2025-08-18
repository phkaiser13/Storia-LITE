
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { LoginRequestDto, AuthResultDto, Role } from '../types';
import Notification from '../components/Notification';
import { FiZap } from 'react-icons/fi';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequestDto>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const onSubmit = async (data: LoginRequestDto) => {
    try {
      const response = await api.post<AuthResultDto>('/api/auth/login', data);
      login(response.data);
      setNotification({ message: 'Login bem-sucedido! Redirecionando...', type: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
      setNotification({ message, type: 'error' });
    }
  };

  const handleSkipLogin = () => {
    const mockAuthResult: AuthResultDto = {
      token: 'dev-token-skip',
      refreshToken: 'dev-refresh-token-skip',
      user: {
        id: 'dev-user',
        fullName: 'Usuário Dev',
        email: 'dev@storia.com',
        role: Role.RH,
      },
    };
    login(mockAuthResult);
    navigate('/');
  };

  const inputClass = "mt-1 block w-full px-4 py-3 bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:border-primary-500 transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-14" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Bem-vindo de Volta</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-8">Faça o login em sua conta.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endereço de E-mail</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'O e-mail é obrigatório' })}
                className={`${inputClass} ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                placeholder="voce@exemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'A senha é obrigatória' })}
                className={`${inputClass} ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary-500/50 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500 text-xs font-semibold">DEV</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

           <button
              type="button"
              onClick={handleSkipLogin}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-yellow-500/50 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FiZap className="mr-2 h-5 w-5" />
              Pular Login (Dev)
            </button>


          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Não tem uma conta?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
              Cadastre-se aqui
            </Link>
          </p>

          <div className="mt-8 flex justify-center items-center space-x-2 text-gray-500 dark:text-gray-400">
              <span className="text-xs">Desenvolvido por</span>
              <img src="/Resources/Images/truvesoftware.svg" alt="Truve Software Logo" className="h-5" />
          </div>
        </div>
      </div>
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default LoginPage;