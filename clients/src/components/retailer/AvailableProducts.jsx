import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { authorizedFetch } from "../../utils/api";

const AvailableProducts = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    authorizedFetch("/api/inventory/get")
      .then((res) => res.json()) // <-- This is missing in your version
      .then((result) => {
        if (result.success && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          console.warn("Unexpected product response:", result);
          setProducts([]);
        }
      })
      .catch(() => setError("Failed to load products."));
  }, []);

  return (
    <div className="flex flex-col items-center text-gray-800 dark:text-white">
      <motion.h2
        className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        📦 Available Products
      </motion.h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="w-full max-w-3xl space-y-4">
        {products.map((prod) => (
          <motion.div
            key={prod._id}
            className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-md shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="text-lg font-semibold">{prod.name}</p>
            <p className="text-sm">Quantity: {prod.totalQuantity}</p>
            <ul className="list-disc list-inside ml-2 text-sm">
              {prod.batches?.map((b, i) => (
                <li key={i}>
                  Qty: {b.quantity} | Expiry:{" "}
                  {new Date(b.expiry).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AvailableProducts;
