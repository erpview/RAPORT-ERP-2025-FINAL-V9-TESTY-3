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
  requireCompanyView?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  allowEditor = false,
  requireUserView = false,
  requireSystemView = false,
  requireCompanyView = false
}) => {
  const { user, isAdmin, isEditor, canViewUsers, canViewSystems, canViewCompanies, loading } = useAuth();

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
    return <Navigate to="/login" />;
  }

  // If admin access is required
  if (requireAdmin) {
    // Allow both admin and editor if allowEditor is true
    if (allowEditor && (isAdmin || isEditor)) {
      return <>{children}</>;
    }
    // Only allow admin if allowEditor is false
    if (!allowEditor && !isAdmin) {
      return <Navigate to="/systemy-erp" />;
    }
  }

  // Check specific view permissions
  if (requireUserView && !canViewUsers && !isAdmin) {
    return <Navigate to="/systemy-erp" />;
  }

  if (requireSystemView && !canViewSystems && !isAdmin) {
    return <Navigate to="/systemy-erp" />;
  }

  if (requireCompanyView && !canViewCompanies && !isAdmin) {
    return <Navigate to="/systemy-erp" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;