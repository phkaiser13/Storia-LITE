
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { LoginRequestDto, AuthResultDto } from '../types';
import Notification from '../components/Notification';

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequestDto>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const onSubmit = async (data: LoginRequestDto) => {
    try {
      const response = await api.post<AuthResultDto>('/api/auth/login', data);
      login(response.data);
      setNotification({ message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setNotification({ message, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-12" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Welcome Back</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-8">Please login to your account.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
            </div>
            
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
              Register here
            </Link>
          </p>

          <div className="mt-8 flex justify-center items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Powered by</span>
              <img src="/Resources/Images/truvesoftware.svg" alt="Truve Software Logo" className="h-5" />
          </div>
        </div>
      </div>
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default LoginPage;