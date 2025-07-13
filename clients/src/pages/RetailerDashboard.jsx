import React from "react";
import RetailerHeader from "../components/RetailerHeader";
import AvailableProducts from "../components/retailer/AvailableProducts";
import OrderHistory from "../components/retailer/OrderHistory";
import Suggestions from "../components/retailer/Suggestions";
import ManualOrderForm from "../components/retailer/ManualOrderForm";

const RetailerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <RetailerHeader />

      {/* First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center h-[400px]">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200 text-center">
            🛒 Order History
          </h2>
          <div className="w-full">
            <OrderHistory />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center h-[400px]">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200 text-center">
            📦 Available Products
          </h2>
          <div className="w-full">
            <AvailableProducts />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center h-[400px]">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200 text-center">
            💡 Smart Suggestions
          </h2>
          <div className="w-full">
            <Suggestions />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center justify-center h-[400px]">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200 text-center">
            📝 Manual Order
          </h2>
          <div className="w-full">
            <ManualOrderForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
