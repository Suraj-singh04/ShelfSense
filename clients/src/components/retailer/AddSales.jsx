import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { useAuth } from "../../context/AuthContext";
import { authorizedFetch } from "../../utils/api";
import * as WTN from "words-to-num";

const toNumber = (text) => {
  const fn =
    (WTN && (WTN.default || WTN.wordsToNumbers || WTN.wordsToNum)) || null;
  if (typeof fn === "function") return fn(text);
  return text;
};

const AddSales = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [match, setMatch] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const { user } = useAuth();
  const [retailerId, setRetailerId] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  console.log(retailers);
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    const fetchRetailersAndProducts = async () => {
      try {
        // Retailers
        const resRetailers = await authorizedFetch("/api/retailer/get");
        const resultRetailers = await resRetailers.json();

        if (
          resultRetailers.success &&
          Array.isArray(resultRetailers.retailers)
        ) {
          setRetailers(resultRetailers.retailers);

          if (user) {
            const matchedRetailer = resultRetailers.retailers.find(
              (r) => r.userId === user.id
            );

            if (matchedRetailer) {
              setRetailerId(matchedRetailer._id);
            } else {
              setError("Retailer not found for this user.");
            }
          }
        } else {
          setRetailers([]);
          setError("No retailers found.");
        }

        // Products
        const resProducts = await authorizedFetch("/api/products/get");
        const resultProducts = await resProducts.json();

        if (resultProducts.success && Array.isArray(resultProducts.products)) {
          setProducts(resultProducts.products);
        } else {
          console.error("Product fetch failed:", resultProducts.message);
          setProducts([]);
        }
      } catch (e) {
        console.error("Error fetching data:", e);
        setError("Server error while fetching data.");
      }
    };

    fetchRetailersAndProducts();
  }, [user]);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    if (!listening) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.toLowerCase();
      setTranscript(spokenText);
      parseTranscript(spokenText);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      alert("Speech recognition error. Please try again.");
    };

    recognition.onend = () => setListening(false);

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [listening, products]);

  const parseTranscript = (text) => {
    const processed = toNumber(text);
    const matchQty = processed.match(/(\d+)/);
    const qty = matchQty ? parseInt(matchQty[1], 10) : 1;

    const cleanedText = processed
      .toLowerCase()
      .replace(/sold|sell|piece|pieces|\d+/gi, "")
      .trim();

    const fuse = new Fuse(products, { keys: ["name"], threshold: 0.4 });
    const result = fuse.search(cleanedText);

    if (result.length > 0) {
      setMatch(result[0].item);
      setQuantity(qty);
      setIsConfirming(true);
    } else {
      alert("Could not match product. Please try again.");
    }
  };

  const confirmAndSubmit = async () => {
    if (!retailerId || !match || !quantity) {
      alert("Missing required data. Please try again.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
      }

      const payload = {
        retailerId,
        productName: match.name,
        unitsSold: quantity,
      };

      const res = await authorizedFetch("/api/retailer/add-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert(`Recorded: Sold ${quantity} x ${match.name}`);
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Submit error", err);
      alert("Server error while logging sale.");
    }

    reset();
  };

  const reset = () => {
    setTranscript("");
    setMatch(null);
    setQuantity(null);
    setIsConfirming(false);
  };

  if (error) {
    return (
      <div className="p-6 border rounded-xl shadow-sm max-w-2xl bg-red-50">
        <h3 className="text-lg font-bold mb-2 text-red-600">Error</h3>
        <p className="text-red-700">{error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0 && !error) {
    return (
      <div className="p-6 border rounded-xl shadow-sm max-w-2xl bg-gray-50">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="p-6 border rounded-2xl shadow-sm max-w-2xl bg-white">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span role="img" aria-label="mic">
              🎤
            </span>{" "}
            Voice Sales Logger
          </h3>
          {listening && (
            <span className="flex items-center gap-2 text-sm text-blue-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              Listening…
            </span>
          )}
        </header>

        {!isConfirming ? (
          <>
            <button
              className={`group relative inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-full transition-all ${
                listening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } shadow-lg shadow-blue-600/20`}
              onClick={() => setListening(!listening)}
              disabled={!SpeechRecognition}
            >
              <MicIcon listening={listening} />
              {listening ? "Stop Listening" : "Start Speaking"}
            </button>

            {!SpeechRecognition && (
              <p className="mt-2 text-red-600 text-sm">
                Speech recognition not supported in this browser.
              </p>
            )}

            {transcript && (
              <p className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm border">
                <span className="font-medium">🗣️ You said:</span> "{transcript}"
              </p>
            )}
          </>
        ) : (
          <ConfirmCard
            quantity={quantity}
            match={match}
            onConfirm={confirmAndSubmit}
            onCancel={reset}
          />
        )}
      </div>

      {retailerId && <RetailerSalesPanels retailerId={retailerId} />}
    </div>
  );
};

function MicIcon({ listening }) {
  return (
    <span className="relative flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${listening ? "text-white" : "text-white"}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7.002 7.002 0 0 0 6 6.92V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A7.002 7.002 0 0 0 19 11z" />
      </svg>
    </span>
  );
}

function ConfirmCard({ quantity, match, onConfirm, onCancel }) {
  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-gray-700 text-lg">
        ✅ Confirm: Sold <strong>{quantity}</strong> ×{" "}
        <strong>{match?.name}</strong>?
      </p>
      <div className="mt-4 flex gap-3">
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
          onClick={onConfirm}
        >
          Yes, Confirm
        </button>
        <button
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
      <div className="h-10 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>
  );
}

function RetailerSalesPanels({ retailerId }) {
  const [activeTab, setActiveTab] = useState("events");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState([]);

  // preload products for filter
  useEffect(() => {
    (async () => {
      try {
        const res = await authorizedFetch("/api/products/get");
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (e) {
        console.error("Failed to load products", e);
      }
    })();
  }, []);

  return (
    <div className="p-6 border rounded-2xl shadow-sm bg-white max-w-5xl">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📊</span> Sales
      </h2>

      {/* Tabs */}
      <div className="mb-4 flex border-b">
        <TabButton
          label="Events"
          active={activeTab === "events"}
          onClick={() => setActiveTab("events")}
        />
        <TabButton
          label="Summary"
          active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        />
      </div>

      {/* Filters */}
      <Filters
        from={from}
        to={to}
        productId={productId}
        setFrom={setFrom}
        setTo={setTo}
        setProductId={setProductId}
        products={products}
      />

      {activeTab === "events" ? (
        <RetailerSalesEvents
          retailerId={retailerId}
          from={from}
          to={to}
          productId={productId}
        />
      ) : (
        <RetailerSalesSummary
          retailerId={retailerId}
          from={from}
          to={to}
          productId={productId}
        />
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      className={`px-4 py-2 -mb-px border-b-2 font-medium transition ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Filters({
  from,
  to,
  productId,
  setFrom,
  setTo,
  setProductId,
  products,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-end mb-6">
      <div>
        <label className="block text-xs text-gray-600 mb-1">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Product</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="border rounded px-2 py-1 min-w-[220px]"
        >
          <option value="">All</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function RetailerSalesEvents({ retailerId, from, to, productId }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = new URLSearchParams();
    if (from) q.append("from", from);
    if (to) q.append("to", to);
    if (productId) q.append("productId", productId);

    (async () => {
      try {
        setLoading(true);
        const res = await authorizedFetch("/api/retailer/sales/data");
        const data = await res.json();
        if (data.success) setSales(data.sales);
      } catch (e) {
        console.error("Failed to fetch retailer sales events", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [retailerId, from, to, productId]);

  if (loading)
    return <div className="text-sm text-gray-500">Loading events...</div>;
  if (!sales.length)
    return <div className="text-sm text-gray-500">No events found.</div>;

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Date</th>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-right">Qty</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={s._id || i} className={i % 2 ? "bg-white" : "bg-gray-50"}>
              <td className="p-3">
                {s.saleDate ? new Date(s.saleDate).toLocaleString() : "-"}
              </td>
              <td className="p-3">{s.productName}</td>
              <td className="p-3 text-right">{s.unitsSold}</td>
              <td className="p-3 text-right">
                {s.priceAtSale != null ? s.priceAtSale.toFixed(2) : "-"}
              </td>
              <td className="p-3 text-right font-medium">
                {s.totalAmount != null ? s.totalAmount.toFixed(2) : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RetailerSalesSummary({ retailerId, from, to, productId }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = new URLSearchParams();
    if (from) q.append("from", from);
    if (to) q.append("to", to);
    if (productId) q.append("productId", productId);

    (async () => {
      try {
        setLoading(true);
        const res = await authorizedFetch("/api/retailer/sales/summary");
        const data = await res.json();
        if (data.success) setSummary(data.summary);
      } catch (e) {
        console.error("Failed to fetch retailer sales summary", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [retailerId, from, to, productId]);

  if (loading)
    return <div className="text-sm text-gray-500">Loading summary...</div>;
  if (!summary.length)
    return <div className="text-sm text-gray-500">No summary available.</div>;

  // Compute totals
  const totalUnits = summary.reduce(
    (sum, row) => sum + (row.unitsSold || 0),
    0
  );
  const totalRevenue = summary.reduce(
    (sum, row) => sum + (row.revenue || 0),
    0
  );

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left font-medium">Product</th>
            <th className="p-3 text-right font-medium">Unit Price</th>
            <th className="p-3 text-right font-medium">Units Sold</th>
            <th className="p-3 text-right font-medium">Revenue</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {summary.map((row, i) => {
            const unitPrice =
              row.unitPrice ??
              (row.unitsSold ? row.revenue / row.unitsSold : 0);

            return (
              <tr
                key={row.productId || i}
                className={i % 2 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-3 text-left">{row.productName}</td>
                <td className="p-3 text-right">
                  {unitPrice != null ? unitPrice.toFixed(2) : "-"}
                </td>
                <td className="p-3 text-right">{row.unitsSold}</td>
                <td className="p-3 text-right font-medium">
                  {row.revenue != null ? row.revenue.toFixed(2) : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot>
          <tr className="bg-gray-200 font-semibold text-gray-800">
            <td className="p-3 text-left" colSpan={2}>
              Total
            </td>
            <td className="p-3 text-right">{totalUnits}</td>
            <td className="p-3 text-right">{totalRevenue.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default AddSales;
