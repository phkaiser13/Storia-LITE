
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
      setNotification({ message: 'Registration successful! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setNotification({ message, type: 'error' });
    }
  };

  const inputClasses = "mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="flex justify-center mb-6">
            <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-12" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Create an Account</h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mt-2 mb-8">Join StorIA-Lite today.</p>
        
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="fullName" className={labelClasses}>Full Name</label>
              <input
                id="fullName"
                type="text"
                {...register('fullName', { required: 'Full name is required' })}
                className={inputClasses}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-2">{errors.fullName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>Email Address</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className={inputClasses}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password"  className={labelClasses}>Password</label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className={inputClasses}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
            </div>
             <div>
              <label htmlFor="confirmPassword"  className={labelClasses}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                className={inputClasses}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-2">{errors.confirmPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default RegisterPage;