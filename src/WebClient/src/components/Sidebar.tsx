
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { FiHome, FiPackage, FiRepeat, FiBarChart2, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark') {
      return true;
    }
    return typeof window !== 'undefined' && !('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-white transform hover:translate-x-1 ${
      isActive ? 'bg-primary-100 dark:bg-gray-700 text-primary-600 dark:text-white font-semibold shadow-inner' : 'font-medium'
    }`;

  return (
    <aside className="h-screen w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col fixed z-10">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-4">
        <div className="p-2 bg-gradient-to-br from-primary-100 to-blue-200 dark:from-gray-700 dark:to-gray-900 rounded-xl">
          <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-12" />
        </div>
        {user && (
          <div className="text-center">
            <p className="font-semibold text-gray-800 dark:text-white truncate">{user.fullName}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{user.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <NavLink to="/" className={navLinkClasses}>
          <FiHome className="mr-3 h-5 w-5 flex-shrink-0" />
          Painel
        </NavLink>
        {(role === Role.Almoxarife || role === Role.RH) && (
          <NavLink to="/items" className={navLinkClasses}>
            <FiPackage className="mr-3 h-5 w-5 flex-shrink-0" />
            Itens
          </NavLink>
        )}
        {role === Role.Almoxarife && (
          <NavLink to="/movements" className={navLinkClasses}>
            <FiRepeat className="mr-3 h-5 w-5 flex-shrink-0" />
            Movimentações
          </NavLink>
        )}
        {role === Role.RH && (
          <NavLink to="/reports" className={navLinkClasses}>
            <FiBarChart2 className="mr-3 h-5 w-5 flex-shrink-0" />
            Relatórios
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
         <button
          onClick={toggleTheme}
          className="w-full flex items-center p-3 rounded-lg font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? <FiSun className="mr-3 h-5 w-5" /> : <FiMoon className="mr-3 h-5 w-5" />}
          {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg font-medium transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
        >
          <FiLogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
      
      <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
        <span className="text-xs">Desenvolvido por</span>
        <img src="/Resources/Images/truvesoftware.svg" alt="Truve Software Logo" className="h-5" />
      </div>
    </aside>
  );
};

export default Sidebar;