import { React, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";

import AddProductForm from "../components/admin/AddProductFormFixed";
import AddInventoryForm from "../components/admin/AddInventoryForm";
import RetailerDetails from "../components/admin/RetailerDetailsFixed";
import AllPurchases from "../components/admin/AllPurchases";
import SuggestedPurchases from "../components/admin/Suggestions";
import { authorizedFetch } from "../utils/api";

// const triggerSuggestionGeneration = async () => {
//   const res = await authorizedFetch("/api/smart-routing/getSuggestions");
//   const data = await res.json();
//   if (data.success) alert("Suggestions generated!");
// };

// triggerSuggestionGeneration();

const AdminDashboard = () => {
  const [productList, setProductList] = useState([]);

  const { logout } = useAuth();
  const fetchProducts = async () => {
    try {
      const res = await authorizedFetch("/api/products/get");
      const data = await res.json();
      if (res.ok) setProductList(data.products || []);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="px-6 py-5 md:px-12 md:py-12 space-y-6">
      {/* Row 1: Add Product + Add Inventory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Product */}
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-center items-center h-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center dark:text-gray-200">
            🧪➕ Add Product
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-center">
            Add new products to your stocklist 🗂️
          </p>
          <AddProductForm onProductAdded={fetchProducts} />
        </motion.div>

        {/* Add Inventory */}
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-center items-center h-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center dark:text-gray-200">
            📦📈 Add Inventory
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-center">
            Manage product batches and keep stock updated 🔄
          </p>
          <div className="w-full px-2 pt-2 pb-2"></div>
          <AddInventoryForm products={productList} />
        </motion.div>
      </div>

      {/* Row 2: Retailer Details + All Purchases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retailer Details */}
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-center items-center h-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center dark:text-gray-200">
            🏪👥 Retailer Details
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-center">
            View and manage all retailers across locations 🌍
          </p>
          <RetailerDetails />
        </motion.div>

        {/* All Purchases */}
        <motion.div
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-center items-center h-[300px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-center dark:text-gray-200">
            🧾📊 All Purchases
          </h2>
          <p className="text-gray-500 dark:text-gray-300 text-center">
            Track every transaction made by retailers 📉
          </p>
          <AllPurchases />
        </motion.div>
      </div>

      {/* Row 3: Suggested Purchases */}
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col justify-center items-center h-[300px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center dark:text-gray-200">
          ✨🤖 Suggested Purchases
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-center">
          AI-powered insights to help restock smartly ⚙️📦
        </p>
        <SuggestedPurchases />
      </motion.div>
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="mb-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
