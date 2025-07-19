import { useState } from "react";
import { authorizedFetch } from "../../utils/api";

const AddInventory = ({ products }) => {
  const [productId, setProductId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("⏳ Adding inventory...");

    try {
      const res = await authorizedFetch("/api/inventory/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, batchId, quantity, expiryDate }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Inventory added successfully!");
        setBatchId("");
        setQuantity("");
        setExpiryDate("");
        setProductId("");
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Error adding inventory.");
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Inventory</h2>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm mx-auto space-y-2"
          >
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Product</option>
              {[...new Map(products.map((p) => [p.name, p])).values()].map(
                (p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                )
              )}
            </select>

            <input
              type="text"
              placeholder="Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
            >
              📦 Add Inventory
            </button>

            {message && <p className="text-center text-sm mt-2">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInventory;
