import React, { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";

const AddSalesForm = () => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState("");
  const [unitsSold, setUnitsSold] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await authorizedFetch("/api/inventory/get");
        const data = await res.json();
        const list = data?.products || data?.data || [];
        setProducts(list);
      } catch (err) {
        console.error("❌ Failed to fetch products.", err);
        setMessage("❌ Failed to fetch products.");
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!productName || !unitsSold || Number(unitsSold) <= 0) {
      setMessage("⚠️ Please select a product and enter a valid quantity.");
      return;
    }

    try {
      const res = await authorizedFetch("/api/retailer/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          unitsSold: Number(unitsSold),
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage("✅ Sales data added!");
        setProductName("");
        setUnitsSold("");
      } else {
        setMessage(`❌ ${result.message || "Error adding sales data."}`);
      }
    } catch (err) {
      console.error("❌ Server error", err);
      setMessage("❌ Server error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        Product:
        <select
          className="w-full p-2 border rounded dark:bg-gray-800"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        >
          <option value="">Select a product</option>
          {[...new Set(products.map((p) => p.name).filter(Boolean))].map(
            (name) => (
              <option key={name} value={name}>
                {name}
              </option>
            )
          )}
        </select>
      </label>

      <label className="block">
        Units Sold:
        <input
          type="number"
          className="w-full p-2 border rounded dark:bg-gray-800"
          value={unitsSold}
          onChange={(e) => setUnitsSold(e.target.value)}
          min="1"
          required
        />
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        📊 Submit Sales
      </button>

      {message && <p className="text-sm text-center">{message}</p>}
    </form>
  );
};

export default AddSalesForm;
