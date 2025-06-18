import React from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { Shield, AlertTriangle } from 'lucide-react';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { isLoading, isError, isAuthenticated } = useAdmin();

  // Show nothing while checking authentication - completely hide everything
  if (isLoading) {
    return null; // Return nothing - completely blank screen
  }

  // Show error if authentication failed
  if (isError || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin panel. Please log in with an admin account.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // If authenticated, render children (admin has full access)
  return <>{children}</>;
};

export default AdminAuthGuard;