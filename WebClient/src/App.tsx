import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { Role } from './types';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ItemsPage from './pages/ItemsPage';
import MovementsPage from './pages/MovementsPage';
import ReportsPage from './pages/ReportsPage';
import LoadingSpinner from './components/LoadingSpinner';
import EpiPage from './pages/EpiPage';
import UsersPage from './pages/UsersPage';
import UserEpiHistoryPage from './pages/UserEpiHistoryPage';
import { syncOfflineMovements } from './services/offlineSync';
import MaintenancePage from './pages/MaintenancePage';
import PurchaseSuggestionsPage from './pages/PurchaseSuggestionsPage';
import AuditLogPage from './pages/AuditLogPage';
import ItemDetailPage from './pages/ItemDetailPage';
import SettingsPage from './pages/SettingsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import SupportPage from './pages/SupportPage';

const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      console.log('Online, attempting to sync...');
      syncOfflineMovements().then(({ success }) => {
        if (success > 0) {
          console.log(`${success} movements were synced successfully.`);
          // This is a placeholder for a global notification system
          alert(`${success} movimentações offline foram sincronizadas com sucesso!`);
          queryClient.invalidateQueries({ queryKey: ['movements'] });
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }
      });
    };

    if (navigator.onLine) {
      handleOnline();
    }

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<SupportPage />} />
          
          <Route element={<RoleBasedRoute allowedRoles={[Role.Almoxarife, Role.RH]} />}>
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/:itemId" element={<ItemDetailPage />} />
            <Route path="/epis" element={<EpiPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/suggestions" element={<PurchaseSuggestionsPage />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={[Role.Almoxarife]} />}>
            <Route path="/movements" element={<MovementsPage />} />
          </Route>

          <Route element={<RoleBasedRoute allowedRoles={[Role.RH]} />}>
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:userId" element={<UserEpiHistoryPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
          </Route>
        </Route>
      </Route>
      
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;