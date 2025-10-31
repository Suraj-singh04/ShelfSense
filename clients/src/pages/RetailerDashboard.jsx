import React, { useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Bell, Settings, ChevronDown, LogOut } from "lucide-react";

import DashboardOverview from "../components/retailer/DashboardOverview";
import AvailableProducts from "../components/retailer/AvailableProducts";
import OrderHistory from "../components/retailer/OrderHistory";
import { useAuth } from "../context/AuthContext";
import AddSales from "../components/retailer/AddSales";
import SmartSuggestions from "../components/retailer/SmartSuggestions";
import Cart from "../components/retailer/Cart";
import InvoicePage from "../components/retailer/stripe/InvoicePage";

const navItems = [
  { name: "Dashboard", path: "", icon: "🏠" },
  { name: "Buy Products", path: "buy-products", icon: "🛒" },
  { name: "Cart", path: "cart", icon: "🛍️" },
  { name: "Order History", path: "order-history", icon: "🕒" },
  { name: "Daily Sales", path: "daily-sales", icon: "📈" },
  { name: "Sales Analytics", path: "sales-analytics", icon: "📊" },
  { name: "Stock Management", path: "stock", icon: "📦" },
  { name: "Smart Recommendations", path: "recommendations", icon: "⚠️" },
];

const RetailerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [showFunctions, setShowFunctions] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.log("Error while logging out", e);
    }
  };

  const isActive = (path) => {
    const fullPath = `/retailer-dashboard/${path}`;
    return (
      location.pathname === fullPath ||
      (path === "" && location.pathname === "/retailer-dashboard")
    );
  };

  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 pt-6 px-4 bg-blue-50 border-r z-30 shadow-md transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
    md:translate-x-0 md:static md:shadow-none`}
      >
        <div className="flex items-center justify-between mb-6 px-2 md:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-red-500 text-2xl"
          >
            <IoMdClose />
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={`/retailer-dashboard/${item.path}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                isActive(item.path)
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 mt-6 text-red-600 hover:text-white hover:bg-gradient-to-r from-red-500 to-pink-500 rounded-xl transition-all duration-200"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header */}
        <header className="bg-blue-50 sticky top-0 z-40 shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between ">
            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-2xl text-gray-800"
            >
              <GiHamburgerMenu />
            </button>

            {/* Branding and Welcome Message */}
            <div className="flex flex-col  sm:flex-row sm:items-center gap-2">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  RetailPro
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back! Here's what's happening.
                </p>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </div>

              {/* Functions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFunctions(!showFunctions)}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md hover:bg-gray-200 transition"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Functions</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showFunctions ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showFunctions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                      <Settings className="w-4 h-4 text-gray-600" />
                      Settings
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3">
                      <Bell className="w-4 h-4 text-gray-600" />
                      Notifications
                    </button>
                    <hr className="my-2" />
                    <button className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Routes>
            <Route index element={<DashboardOverview />} />
            <Route path="buy-products" element={<AvailableProducts />} />
            <Route path="cart" element={<Cart />} />

            <Route path="order-history" element={<OrderHistory />} />
            <Route path="daily-sales" element={<AddSales />} />
            <Route path="recommendations" element={<SmartSuggestions />} />
            <Route path="invoice" element={<InvoicePage />} />

            <Route path="*" element={<Navigate to="/retailer-dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default RetailerDashboard;
