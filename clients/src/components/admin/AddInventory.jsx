import { useState, useEffect } from "react";
import { authorizedFetch } from "../../utils/api";
import { FaPlus } from "react-icons/fa";

const AddInventory = ({ products = [], inventory }) => {
  const [productId, setProductId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [message, setMessage] = useState("");
  console.log(inventory);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Adding inventory...");

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

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Inventory added successfully!");
        setProductId("");
        setBatchId("");
        setQuantity("");
        setExpiryDate("");
        setArrivalDate("");
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding inventory.");
    }
  };

  useEffect(() => {
    if (!batchId || !productId) return;

    const selectedProduct = inventory.find((item) => item._id === productId);
    const selectedBatch = selectedProduct?.batches?.find(
      (b) => b.batchId === batchId
    );

    if (selectedBatch?.expiry) {
      setExpiryDate(selectedBatch.expiry.substring(0, 10));
    }
  }, [batchId, productId, inventory]);

  return (
    <div className="p-6 space-y-8">
      {/* Form Box */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4">📦 Add Inventory</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
        >
          {/* Select Product Dropdown */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              🧾 Select Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="p-3 border rounded-lg shadow-sm"
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
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              🧪 Enter or Select Batch ID
            </label>
            <input
              type="text"
              list="batch-suggestions"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Enter new or existing batch ID"
              className="p-3 border rounded-lg shadow-sm"
              required
            />
            <datalist id="batch-suggestions">
              {(
                inventory.find((item) => item._id === productId)?.batches || []
              ).map((batch) => (
                <option key={batch.batchId} value={batch.batchId} />
              ))}
            </datalist>
          </div>

          {/* Quantity */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              📦 Quantity
            </label>
            <input
              type="number"
              value={quantity}
              placeholder="Enter Quantity"
              onChange={(e) => setQuantity(e.target.value)}
              className="p-3 border rounded-lg shadow-sm"
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              ⏳ Expiry Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="p-3 border rounded-lg shadow-sm"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 transition-all duration-300"
          >
            <FaPlus /> Add Inventory
          </button>
        </form>

        {/* Feedback Message */}
        {message && <p className="text-sm text-center">🔔 {message}</p>}
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-6 text-blue-700 flex items-center gap-2">
          📋 Inventory List
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700 border-collapse rounded-lg overflow-hidden">
            <thead className="bg-blue-100 text-blue-900 text-left uppercase text-xs sticky top-0 z-10">
              <tr>
                <th className="p-4">🆔 ID</th>
                <th className="p-4">📦 Product</th>
                <th className="p-4">🔢 Batch</th>
                <th className="p-4">⏳ Expiry</th>
                <th className="p-4">📅 Arrival</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.length > 0 ? (
                inventory.map((item, index) => (
                  <tr
                    key={item._id}
                    className={`transition-all hover:bg-blue-50 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-4 font-mono text-xs text-gray-600">
                      {item._id}
                    </td>
                    <td className="p-4 font-medium">{item.name}</td>
                    <td className="p-4">{item.batches[0]?.batchId || "N/A"}</td>
                    <td className="p-4">
                      {item.batches[0]?.expiry
                        ? new Date(item.batches[0].expiry).toLocaleDateString()
                        : "N/A"}
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
                    className="text-center text-gray-500 p-6 italic bg-gray-50"
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
  );
};

export default AddInventory;
