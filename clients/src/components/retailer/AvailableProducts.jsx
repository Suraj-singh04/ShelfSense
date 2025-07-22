// src/components/AvailableProducts.jsx
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { authorizedFetch } from "../../utils/api";
import OrderModal from "./OrderModal";

const AvailableProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    authorizedFetch("/api/inventory/get")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.products)) {
          setProducts(result.products);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setError("Failed to load products."));
  }, []);
  console.log(error);
  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto text-gray-800">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-8">
        🛒 Available Products
      </h2>

      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
        />
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl overflow-hidden shadow-md border hover:shadow-lg transition-all"
            >
              <img
                src={product.image || "/placeholder.jpg"}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 flex flex-col justify-between h-[200px]">
                <div>
                  <h3 className="text-lg font-semibold truncate">
                    {product.name || "Unnamed"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.category || "N/A"}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      product.totalQuantity > 50
                        ? "bg-green-100 text-green-800"
                        : product.totalQuantity > 20
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.totalQuantity} in stock
                  </span>
                  <span className="text-base font-bold text-green-600">
                    ₹{product.price || "?"}
                  </span>
                </div>
                <button
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm"
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowModal(true);
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No products found.</p>
      )}

      {showModal && (
        <OrderModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AvailableProducts;
