import { useState, useEffect, useMemo } from "react";
import { authorizedFetch } from "../../utils/api";
import { FaPlus, FaSpinner, FaBoxes, FaClipboardList } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

// Format date for <input type="date" />
const toDateInputValue = (date) => {
  if (!date) return "";
  const dt = new Date(date);
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().substring(0, 10);
};

// Get batch list for selected product
const getBatchesForProduct = (productId, products = []) => {
  if (!productId) return [];
  const product = products.find((p) => p._id === productId);
  if (!product || !Array.isArray(product.batches)) return [];
  return product.batches.map((b) => ({
    batchId: b.batchId,
    expiryDate: b.expiryDate,
  }));
};

const AddInventory = ({ products = [], inventory = [] }) => {
  const [productId, setProductId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [loading, setLoading] = useState(false);

  const batchOptions = useMemo(
    () => getBatchesForProduct(productId, products),
    [productId, products]
  );

  useEffect(() => {
    if (!productId) {
      setBatchId("");
      setExpiryDate("");
      return;
    }
    if (batchOptions.length === 1) {
      setBatchId(batchOptions[0].batchId);
      setExpiryDate(toDateInputValue(batchOptions[0].expiryDate));
    } else {
      setBatchId("");
      setExpiryDate("");
    }
  }, [productId, batchOptions]);

  useEffect(() => {
    if (!batchId) {
      setExpiryDate("");
      return;
    }
    const selected = batchOptions.find((b) => b.batchId === batchId);
    if (selected?.expiryDate) {
      setExpiryDate(toDateInputValue(selected.expiryDate));
    }
  }, [batchId, batchOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId || !batchId || !quantity) {
      toast.error("Please fill in product, batch and quantity.");
      return;
    }

    setLoading(true);
    const t = toast.loading("Adding inventory...");

    try {
      const res = await authorizedFetch("/api/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          batchId,
          quantity,
          expiryDate,
          arrivalDate,
        }),
      });

      const data = await res.json().catch(() => ({}));
      toast.dismiss(t);

      if (res.ok) {
        toast.success("Inventory added successfully!");
        setBatchId("");
        setQuantity("");
        setExpiryDate("");
        setArrivalDate("");
      } else {
        toast.error(data?.message || "Failed to add inventory.");
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(t);
      toast.error("Error adding inventory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 drop-shadow-lg flex items-center justify-center gap-2">
          <FaBoxes /> Inventory Manager
        </h1>
        <p className="text-gray-400 mt-2">
          Manage and track your product stock with ease ✨
        </p>
      </div>

      {/* GRID: Form + Inventory List */}
      <div className="grid grid-cols-[350px,1fr] gap-8">
        {/* LEFT: FORM */}
        <form
          onSubmit={handleSubmit}
          whileHover={{ scale: 2 }}
          className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-lg p-6 mb-10 backdrop-blur-md transition-all duration-300 space-y-4"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 text-purple-400">
            <FaPlus /> Add Inventory
          </h2>

          {/* Product */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-300">🧾 Select Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="p-3 rounded-lg bg-[#111] border border-gray-700 text-gray-200 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            >
              <option value="">-- Choose a product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {p.category ? `(${p.category})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-300">🧪 Select Batch</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="p-3 rounded-lg bg-[#111] border border-gray-700 text-gray-200 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              disabled={batchOptions.length === 0}
              required
            >
              <option value="">
                {batchOptions.length === 0
                  ? "No batches available"
                  : "-- Choose a batch --"}
              </option>
              {batchOptions.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-300">📦 Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="p-3 rounded-lg bg-[#111] border border-gray-700 text-gray-200 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              min={1}
              required
            />
          </div>

          {/* Expiry */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-300">⏳ Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              readOnly
              className="p-3 rounded-lg bg-[#111] border border-gray-700 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Arrival */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-300">📅 Arrival Date</label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="p-3 rounded-lg bg-[#111] border border-gray-700 text-gray-200 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <FaPlus />
                <span>Add Inventory</span>
              </>
            )}
          </button>
        </form>

        {/* RIGHT: INVENTORY LIST */}
        <div
          whileHover={{ scale: 1.005 }}
          className="bg-gray-900/70 border border-gray-700 rounded-2xl shadow-lg p-6 backdrop-blur-md"
        >
          <h3 className="text-xl font-semibold flex items-center gap-2 text-green-400 mb-4">
            <FaClipboardList /> Inventory List
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-300">
              <thead className="bg-[#111] text-gray-400 uppercase text-xs">
                <tr>
                  <th className="p-4">🆔 ID</th>
                  <th className="p-4">📦 Product</th>
                  <th className="p-4">🔢 Batches</th>
                  <th className="p-4">⏳ Expiries</th>
                  <th className="p-4">📅 Arrival</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {Array.isArray(inventory) && inventory.length > 0 ? (
                  inventory.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`transition-all duration-200 hover:bg-purple-900/20 ${
                        index % 2 === 0 ? "bg-[#151515]" : "bg-[#1f1f22]"
                      }`}
                    >
                      <td className="p-4 font-mono text-xs text-gray-500">
                        {item._id}
                      </td>
                      <td className="p-4 font-medium">{item.name}</td>
                      <td className="p-4">
                        {item.batches.map((b) => b.batchId).join(", ")}
                      </td>
                      <td className="p-4">
                        {item.batches
                          .map((b) =>
                            b.expiryDate
                              ? new Date(b.expiryDate).toLocaleDateString()
                              : "N/A"
                          )
                          .join(", ")}
                      </td>
                      <td className="p-4">
                        {item.arrivalDate
                          ? new Date(item.arrivalDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-500 p-6 italic bg-[#151515]"
                    >
                      No inventory found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventory;
