import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ResetPassword";
import PaymentSuccess from "./components/retailer/stripe/PaymentSuccess";
import PaymentCancel from "./components/retailer/stripe/PaymentCancel";

const App = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          !currentUser ? (
            <Login />
          ) : currentUser.role === "admin" ? (
            <Navigate to="/admin-dashboard" />
          ) : (
            <Navigate to="/retailer-dashboard" />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
      <Route path="/retailer-dashboard/*" element={<RetailerDashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ChangePassword />} />

      <Route path="/success" element={<PaymentSuccess />} />
      <Route path="/cancel" element={<PaymentCancel />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
