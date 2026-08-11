import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only routes (e.g. /admin)
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Business dashboard routes
  if (!adminOnly) {
    const pathBusinessId = window.location.pathname.split('/dashboard/')[1];
    if (
      pathBusinessId &&
      user?.role !== 'admin' &&
      user?.businessId !== pathBusinessId
    ) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this dashboard.
            </p>
            <button
              onClick={() => window.location.href = `/dashboard/${user.businessId}`}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-lg transition"
            >
              Go to My Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Admin landing on a vendor dashboard route directly — send to /admin instead
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;