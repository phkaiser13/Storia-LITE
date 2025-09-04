import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { LoginRequestDto, AuthResultDto, Role } from '../types';
import Notification from '../components/Notification';
import { FiZap, FiLogIn } from 'react-icons/fi';
import Modal from '../components/Modal';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequestDto>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);

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

  const handleSkipLogin = (role: Role) => {
    const mockAuthResult: AuthResultDto = {
      token: 'dev-token-skip',
      refreshToken: 'dev-refresh-token-skip',
      user: {
        id: 'dev-user',
        fullName: `Usuário Dev (${role})`,
        email: `dev-${role.toLowerCase()}@storia.com`,
        role: role,
      },
    };
    login(mockAuthResult);
    setIsRoleSelectorOpen(false);
    navigate('/');
  };

  const inputClass = "mt-1 block w-full px-4 py-3 bg-black/20 border border-dark-border rounded-lg shadow-sm placeholder-dark-text-muted text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500/80 focus:border-primary-500 transition-all duration-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 auth-background">
      <div className="w-full max-w-md mx-auto bg-dark-glass backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-dark-border animate-fade-in-up">
        
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="p-2 mb-4 bg-white/10 rounded-lg">
                <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-14" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-center text-dark-text">Bem-vindo de Volta</h1>
            <p className="text-center text-dark-text-muted mt-2">Faça o login em sua conta.</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-text-muted">Endereço de E-mail</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'O e-mail é obrigatório' })}
                className={`${inputClass} ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
                placeholder="voce@exemplo.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-dark-text-muted">Senha</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'A senha é obrigatória' })}
                className={`${inputClass} ${errors.password ? 'border-red-500 ring-red-500' : ''}`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-surface focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <FiLogIn className="mr-2 h-5 w-5"/>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <button
              type="button"
              onClick={() => setIsRoleSelectorOpen(true)}
              className="mt-4 w-full flex items-center justify-center py-3 px-4 border-2 border-dark-border rounded-lg shadow-sm text-sm font-medium text-dark-text-muted bg-transparent hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-surface focus:ring-slate-500 transition-all duration-300"
            >
              <FiZap className="mr-2 h-5 w-5 text-amber-500" />
              Pular Login (Modo Desenvolvedor)
            </button>
        </div>
      </div>

      <Modal isOpen={isRoleSelectorOpen} onClose={() => setIsRoleSelectorOpen(false)} title="Selecionar Função de Desenvolvedor">
        <div className="p-2">
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">Escolha com qual função você deseja acessar o sistema.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.values(Role).map((roleValue) => (
                    <button
                        key={roleValue}
                        onClick={() => handleSkipLogin(roleValue)}
                        className="p-4 text-center bg-slate-100 hover:bg-primary-50 dark:bg-white/5 dark:hover:bg-primary-500/10 rounded-lg font-semibold text-slate-700 dark:text-slate-200 transition-all duration-200 transform hover:scale-105 hover:text-primary-600 dark:hover:text-primary-400 border-2 border-transparent hover:border-primary-300 dark:hover:border-primary-500/50"
                    >
                        {roleValue}
                    </button>
                ))}
            </div>
        </div>
      </Modal>

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default LoginPage;