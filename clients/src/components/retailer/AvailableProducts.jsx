// src/components/AvailableProducts.jsx
import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { authorizedFetch } from "../../utils/api";
import OrderModal from "./OrderModal";

const AvailableProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [sortOption, setSortOption] = useState("price-asc");
  const [categoryFilter, setCategoryFilter] = useState("all");

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

  // Filter + Search
  const filtered = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) =>
      categoryFilter === "all" ? true : product.category === categoryFilter
    )
    .sort((a, b) => {
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      if (sortOption === "stock-asc") return a.totalQuantity - b.totalQuantity;
      if (sortOption === "stock-desc") return b.totalQuantity - a.totalQuantity;
      return 0;
    });

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900">
      <div className="relative h-64 sm:h-80 lg:h-96 ">
        <img
          src="/groceryBackImg.jpg"
          alt="Products Banner"
          className="w-full h-full object-cover z-1"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-blue-50 dark:to-gray-900" />
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                w-full max-w-5xl px-6 z-20"
        >
          <div
            className="backdrop-blur-sm bg-transparent 
                  rounded-xl shadow-lg p-4 flex flex-col md:flex-row 
                  items-center gap-4"
          >
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-300 
                   dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-green-500 
                   focus:outline-none transition bg-white/50 dark:bg-gray-900/70"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 
                 rounded-lg bg-white/90 dark:bg-gray-900/70 focus:ring-2 
                 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {[
                ...new Set(products.map((p) => p.category).filter(Boolean)),
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sorting */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 
                 rounded-lg bg-white/90 dark:bg-gray-900/70 focus:ring-2 
                 focus:ring-green-500"
            >
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="stock-asc">Stock: Low → High</option>
              <option value="stock-desc">Stock: High → Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-6 py-10 pt-24 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
        {/* Product Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden 
             shadow-md flex flex-col 
             transform transition-all duration-300 ease-out 
             hover:-translate-y-2 hover:scale-[1.02] 
             hover:shadow-[0_12px_30px_rgba(34,197,94,0.25)]"
              >
                {/* Image */}
                <div className="w-full h-56 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => (e.target.src = "/placeholder.jpg")}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1 truncate">
                      {product.name || "Unnamed"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">
                      {product.category || "N/A"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600">
                        ₹{product.price || "?"}
                      </span>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full ${
                          product.totalQuantity > 50
                            ? "bg-green-100 text-green-800"
                            : product.totalQuantity > 20
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.totalQuantity} in stock
                      </span>
                    </div>
                  </div>

                  <button
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition"
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
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg">
            No products found.
          </p>
        )}
      </div>

      {/* Modal */}
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
