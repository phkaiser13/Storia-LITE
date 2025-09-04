import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-7xl w-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;