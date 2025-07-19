import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import RetailerDashboard from "./pages/RetailerDashboard";

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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
