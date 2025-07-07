import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import TopProductsChart from "../components/TopProductsChart";
import StockOvertimeChart from "../components/StockOvertimeChart";
import SellThroughChart from "../components/SellThroughChart";
import HistoryGraph from "../components/HistoryGraph";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
          <TopHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

          <div className="p-6 space-y-6">
            {/* Title and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Current Metrics</h2>
              <div className="flex space-x-2 mt-2 md:mt-0">
                <select className="px-3 py-1 rounded-md border dark:bg-gray-800">
                  <option>Select date range</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>This month</option>
                </select>
                <button className="px-3 py-1 bg-blue-500 text-white rounded-md">Current Month</button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Sales */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">Total Sales</h3>
                <p className="text-2xl font-bold mb-2">$15,000</p>
                <p className="text-green-500 mb-2">+5.07%</p>
                <HistoryGraph />
              </div>

              {/* Products in Stock */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">Products in Stock</h3>
                <p className="text-2xl font-bold mb-2">120</p>
                <p className="text-yellow-500 mb-2">3 Expiring</p>
                <StockOvertimeChart />
              </div>

              {/* Sell-Through Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow">
                <h3 className="text-lg font-semibold mb-2 text-center">Sell-Through Rate</h3>
                <SellThroughChart />
              </div>
            </div>

            {/* Top Performing Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
              <h3 className="text-xl font-semibold mb-4">Top Performing Products</h3>
              <TopProductsChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
