import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
// Import your other components here
// import AdminDashboard from './components/AdminDashboard';
// import RetailerDashboard from './components/RetailerDashboard';

// Protected Route Component

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Main App Component
const AppContent = () => {
  const { user } = useAuth();
  const getHomeRedirect = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin-dashboard";
    if (user.role === "retailer") return "/retailer-dashboard";
    return "/unauthorized";
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getHomeRedirect()} />} />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={
                user.role === "admin"
                  ? "/admin-dashboard"
                  : "/retailer-dashboard"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/retailer-dashboard"
        element={
          <ProtectedRoute requiredRole="retailer">
            <RetailerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Unauthorized Access
              </h1>
              <p className="text-gray-600">
                You don't have permission to access this page.
              </p>
            </div>
          </div>
        }
      />

      {/* Optional: catch-all fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
