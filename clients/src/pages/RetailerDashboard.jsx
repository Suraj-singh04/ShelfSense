// pages/RetailerDashboard.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Chart Overview
import TopProductsChart from "../components/TopProductsChart";
import StockOvertimeChart from "../components/StockOvertimeChart";
import SellThroughChart from "../components/SellThroughChart";
import HistoryGraph from "../components/HistoryGraph";

// Order Section
import RetailerHeader from "../components/RetailerHeader";
import AvailableProducts from "../components/retailer/AvailableProducts";
import OrderHistory from "../components/retailer/OrderHistory";
import Suggestions from "../components/retailer/SuggestedPurchases";
import ManualOrderForm from "../components/retailer/ManualOrderForm";

//Add Sales
import AddSalesForm from "../components/retailer/AddSalesForm";

const RetailerDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-all duration-300">
        {/* Sidebar */}
        <Sidebar>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`block w-full text-left px-4 py-2 rounded hover:bg-teal-600 ${
                activeTab === "overview"
                  ? "bg-teal-700 text-white"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`block w-full text-left px-4 py-2 rounded hover:bg-teal-600 ${
                activeTab === "orders"
                  ? "bg-teal-700 text-white"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              🗃️ Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-800 rounded"
            >
              🚪 Logout
            </button>
          </div>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 w-full overflow-hidden">
          <TopHeader
            darkMode={darkMode}
            toggleDarkMode={() => setDarkMode(!darkMode)}
          />

          <main className="px-6 py-6 max-w-7xl mx-auto">
            {activeTab === "overview" && (
              <>
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold flex items-center gap-2">
                    📊 Current Metrics
                  </h2>
                  <div className="flex items-center gap-2 mt-3 md:mt-0">
                    <select className="px-3 py-2 rounded-md border dark:border-gray-600 dark:bg-gray-800 text-sm">
                      <option>Select date range</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>This month</option>
                    </select>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                      Current Month
                    </button>
                  </div>
                </div>

                {/* Chart Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-1">
                      💰 Total Sales
                    </h3>
                    <p className="text-3xl font-bold">$15,000</p>
                    <p className="text-green-500 text-sm mb-3">+5.07%</p>
                    <HistoryGraph />
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-1">📦 In Stock</h3>
                    <p className="text-3xl font-bold">120</p>
                    <p className="text-yellow-500 text-sm mb-3">3 Expiring</p>
                    <StockOvertimeChart />
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-center">
                      📈 Sell-Through Rate
                    </h3>
                    <div className="w-full flex justify-center items-center">
                      <div className="w-full max-w-[200px] h-[200px]">
                        <SellThroughChart />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
                  <h3 className="text-xl font-semibold mb-4">
                    🏆 Top Performing Products
                  </h3>
                  <TopProductsChart />
                </div>
              </>
            )}

            {activeTab === "orders" && (
              <>
                <RetailerHeader />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-[400px] overflow-auto">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      🛒 Order History
                    </h2>
                    <OrderHistory />
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-[400px] overflow-auto">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      📦 Available Products
                    </h2>
                    <AvailableProducts />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-[400px] overflow-auto">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      💡 Smart Suggestions
                    </h2>
                    <Suggestions />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-[400px] overflow-auto">
                      <h2 className="text-xl font-semibold mb-4 text-center">
                        📈 Add Sales Data
                      </h2>
                      <AddSalesForm />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md h-[400px] overflow-auto">
                    <h2 className="text-xl font-semibold mb-4 text-center">
                      📝 Manual Order
                    </h2>
                    <ManualOrderForm />
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
