import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
       const res = await fetch("/api/retailer/68700fe72da973f43591bb1b/orders");

        const result = await res.json();

        if (result.success && Array.isArray(result.orders)) {
          setOrders(result.orders);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("❌ Failed to load orders. Please try again later.");
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="max-h-64 overflow-y-auto w-full text-sm">
      <motion.h1
        className="text-lg font-bold text-green-600 dark:text-green-400 mb-4 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        ✅ Order History
      </motion.h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {orders.length === 0 ? (
        <motion.p
          className="text-gray-500 dark:text-gray-400 animate-pulse text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          📦 No orders found.
        </motion.p>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              className="p-3 border rounded-lg bg-green-50 dark:bg-green-950 shadow-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p><strong>📦 Product:</strong> {order.product?.name}</p>
              <p><strong>🔢 Qty:</strong> {order.quantity}</p>
              <p><strong>📅 Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
