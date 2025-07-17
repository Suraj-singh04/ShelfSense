import React from "react";
import TopProductsChart from "../components/TopProductsChart";
import StockOvertimeChart from "../components/StockOvertimeChart";
import SellThroughChart from "../components/SellThroughChart";
import HistoryGraph from "../components/HistoryGraph";

const Dashboard = () => {
  return (
    <main className="px-4 sm:px-6 md:px-8 py-6 max-w-7xl mx-auto">
            {/* Header Section */}
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

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Sales */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-1">💰 Total Sales</h3>
                <p className="text-3xl font-bold">$15,000</p>
                <p className="text-green-500 text-sm mb-3">+5.07%</p>
                <HistoryGraph />
              </div>

              {/* In Stock */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-1">📦 In Stock</h3>
                <p className="text-3xl font-bold">120</p>
                <p className="text-yellow-500 text-sm mb-3">3 Expiring</p>
                <StockOvertimeChart />
              </div>

              {/* Sell Through */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center h-[400px]">
                <h3 className="text-lg font-semibold mb-4 text-center">📈 Sell-Through Rate</h3>
                <div className="w-full flex justify-center items-center">
                 <div className="w-full max-w-[200px] h-[200px]">
                    <SellThroughChart />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-8">
              <h3 className="text-xl font-semibold mb-4">🏆 Top Performing Products</h3>
              <TopProductsChart />
            </div>
          </main>
  );
};

export default Dashboard;
