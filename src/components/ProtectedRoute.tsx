import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  allowEditor?: boolean;
  requireUserView?: boolean;
  requireSystemView?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  allowEditor = false,
  requireUserView = false,
  requireSystemView = false
}) => {
  const { user, isAdmin, isEditor, canViewUsers, canViewSystems, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#86868b]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="text-[17px]">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" />;
  }

  if (requireAdmin && !isAdmin && !allowEditor) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && !isAdmin && allowEditor && !isEditor) {
    return <Navigate to="/" />;
  }

  if (requireUserView && !canViewUsers && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (requireSystemView && !canViewSystems && !isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};