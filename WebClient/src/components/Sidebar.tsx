import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { FiGrid, FiPackage, FiRepeat, FiBarChart2, FiLogOut, FiSun, FiMoon, FiShield, FiUsers, FiTool, FiShoppingCart, FiList, FiSettings, FiHelpCircle } from 'react-icons/fi';

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
    `flex items-center px-4 py-3 my-1 rounded-xl transition-all duration-300 group relative ${
      isActive 
      ? 'font-semibold' 
      : 'text-light-text-muted dark:text-dark-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-light-text dark:hover:text-dark-text'
    }`;
    
  const ActiveIndicator = () => (
    <>
        <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 rounded-xl z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary-500 rounded-r-full shadow-glow-primary"></div>
    </>
  );

  const renderNavLink = (to: string, icon: React.ReactElement<{ className?: string }>, text: string) => (
    <NavLink to={to} className={navLinkClasses}>
      {({ isActive }) => (
        <>
          {isActive && <ActiveIndicator />}
          {React.cloneElement(icon, { className: `ml-2 mr-4 h-5 w-5 flex-shrink-0 transition-colors relative z-10 ${isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}` })}
          <span className={`flex-1 relative z-10 transition-colors ${isActive ? 'text-light-text dark:text-dark-text' : ''}`}>{text}</span>
        </>
      )}
    </NavLink>
  );

  return (
    <aside className="h-screen w-72 bg-light-glass dark:bg-dark-glass backdrop-blur-3xl border-r border-light-border dark:border-dark-border flex-col fixed z-20 hidden lg:flex">
      <div className="p-6">
        <div className='flex items-center gap-3 mb-8'>
            <div className="p-2 bg-white/80 dark:bg-white/10 rounded-lg">
              <img src="/Resources/AppIcon/appicon.svg" alt="StorIA-Lite Logo" className="h-10" />
            </div>
            <h1 className="font-heading text-xl font-bold text-light-text dark:text-dark-text">StorIA-Lite</h1>
        </div>
        {user && (
          <div className="text-left bg-black/5 dark:bg-black/20 p-4 rounded-xl border border-light-border dark:border-dark-border">
            <p className="font-semibold text-light-text dark:text-dark-text truncate" title={user.fullName}>{user.fullName}</p>
            <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{user.role}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4">
        {renderNavLink("/", <FiGrid />, "Painel")}
        {(role === Role.Almoxarife || role === Role.RH) && renderNavLink("/items", <FiPackage />, "Itens")}
        {(role === Role.Almoxarife || role === Role.RH) && renderNavLink("/epis", <FiShield />, "Gestão de EPIs")}
        {(role === Role.Almoxarife || role === Role.RH) && renderNavLink("/maintenance", <FiTool />, "Manutenção")}
        {role === Role.Almoxarife && renderNavLink("/movements", <FiRepeat />, "Movimentações")}
        {(role === Role.Almoxarife || role === Role.RH) && renderNavLink("/suggestions", <FiShoppingCart />, "Sugestões de Compra")}
        {role === Role.RH && renderNavLink("/reports", <FiBarChart2 />, "Relatórios")}
        {role === Role.RH && renderNavLink("/users", <FiUsers />, "Colaboradores")}
        {role === Role.RH && renderNavLink("/audit-log", <FiList />, "Auditoria")}
        {renderNavLink("/support", <FiHelpCircle />, "Suporte")}
      </nav>

      <div className="p-4 border-t border-light-border dark:border-dark-border space-y-2">
         <button
          onClick={toggleTheme}
          className="w-full flex items-center p-3 rounded-lg font-medium transition-colors text-light-text-muted dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-white/5"
        >
          {isDarkMode ? <FiSun className="mr-4 h-5 w-5 text-amber-400" /> : <FiMoon className="mr-4 h-5 w-5 text-slate-400" />}
          Alterar Tema
        </button>
        <NavLink to="/settings" className="w-full flex items-center p-3 rounded-lg font-medium transition-colors text-light-text-muted dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-white/5">
            <FiSettings className="mr-4 h-5 w-5" />
            Configurações da Conta
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 rounded-lg font-medium transition-colors text-light-text-muted hover:text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10"
        >
          <FiLogOut className="mr-4 h-5 w-5" />
          Sair
        </button>
      </div>
      
      <div className="p-4 flex justify-center items-center space-x-2 border-t border-light-border dark:border-dark-border text-light-text-muted dark:text-dark-text-muted">
        <span className="text-xs">Desenvolvido por</span>
        <img src="/Resources/images/truvesoftware.svg" alt="Truve Software Logo" className="h-4 opacity-70" />
      </div>
    </aside>
  );
};

export default Sidebar;