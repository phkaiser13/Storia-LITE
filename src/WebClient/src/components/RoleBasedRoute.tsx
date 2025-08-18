import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import DashboardPage from '../pages/DashboardPage';

interface RoleBasedRouteProps {
  allowedRoles: Role[];
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles }) => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null; 
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
};

export default RoleBasedRoute;
