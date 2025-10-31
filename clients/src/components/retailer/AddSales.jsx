import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { useAuth } from "../../context/AuthContext";
import { authorizedFetch } from "../../utils/api";

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

  // console.log(retailers);
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
    // Enhanced number parsing with word-to-number conversion
    const numberWords = {
      zero: 0,
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
      nineteen: 19,
      twenty: 20,
      thirty: 30,
      forty: 40,
      fifty: 50,
      sixty: 60,
      seventy: 70,
      eighty: 80,
      ninety: 90,
      hundred: 100,
    };

    let processed = text.toLowerCase();

    // Replace number words with digits
    Object.keys(numberWords).forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      processed = processed.replace(regex, numberWords[word].toString());
    });

    // Handle compound numbers like "twenty five" -> "25"
    processed = processed.replace(/(\d+)\s+(\d+)/g, (match, tens, ones) => {
      const tensNum = parseInt(tens);
      const onesNum = parseInt(ones);
      if (tensNum >= 20 && tensNum <= 90 && onesNum >= 1 && onesNum <= 9) {
        return (tensNum + onesNum).toString();
      }
      return match;
    });

    // Extract quantity - look for numbers in the processed text
    const matchQty = processed.match(/\b(\d+)\b/);
    const qty = matchQty ? parseInt(matchQty[1], 10) : 1;

    const cleanedText = processed
      .replace(/sold|sell|piece|pieces|\d+/gi, "")
      .replace(
        /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/gi,
        ""
      )
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
        alert(`✅ Recorded: Sold ${quantity} x ${match.name}`);
      } else {
        if (data.availableQuantity !== undefined) {
          alert(
            `❌ ${data.message}\n\nYou need to purchase ${
              data.requestedQuantity - data.availableQuantity
            } more units of ${data.productName} to complete this sale.`
          );
        } else {
          alert(`❌ Failed: ${data.message}`);
        }
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-red-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-red-600">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Voice Sales Logger Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
                  <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7.002 7.002 0 0 0 6 6.92V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A7.002 7.002 0 0 0 19 11z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Voice Sales Logger
                </h1>
                <p className="text-gray-600">
                  Speak to record your sales instantly
                </p>
              </div>
            </div>
            {listening && (
              <div className="flex items-center gap-3 px-4 py-2 bg-red-50 rounded-full border border-red-200">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <span className="text-sm font-medium text-red-700">
                  Recording...
                </span>
              </div>
            )}
          </div>

          {!isConfirming ? (
            <div className="space-y-6">
              <div className="text-center">
                <button
                  className={`group relative inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 ${
                    listening
                      ? "bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
                  }`}
                  onClick={() => setListening(!listening)}
                  disabled={!SpeechRecognition}
                >
                  <MicIcon listening={listening} />
                  {listening ? "Stop Recording" : "Start Speaking"}
                </button>

                {!SpeechRecognition && (
                  <p className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-200">
                    Speech recognition is not supported in this browser.
                  </p>
                )}
              </div>

              {transcript && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 mb-1">
                        You said:
                      </p>
                      <p className="text-blue-800 italic">"{transcript}"</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ConfirmCard
              quantity={quantity}
              match={match}
              onConfirm={confirmAndSubmit}
              onCancel={reset}
            />
          )}
        </div>

        {/* Dashboard Panels */}
        {retailerId && (
          <div className="grid lg:grid-cols-2 gap-8">
            <RetailerInventoryPanel retailerId={retailerId} />
            <RetailerSalesPanels retailerId={retailerId} />
          </div>
        )}
      </div>
    </div>
  );
};

function MicIcon({ listening }) {
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3z" />
        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7.002 7.002 0 0 0 6 6.92V20H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.08A7.002 7.002 0 0 0 19 11z" />
      </svg>
      {listening && (
        <div className="absolute -inset-1 bg-white/20 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}

function ConfirmCard({ quantity, match, onConfirm, onCancel }) {
  const [inventoryInfo, setInventoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventoryInfo = async () => {
      try {
        setLoading(true);
        const res = await authorizedFetch("/api/retailer/inventory");
        const data = await res.json();
        if (data.success) {
          const productInventory = data.inventory.find(
            (item) => item.productName === match?.name
          );
          setInventoryInfo(productInventory);
        }
      } catch (e) {
        console.error("Failed to fetch inventory info", e);
      } finally {
        setLoading(false);
      }
    };

    if (match) {
      fetchInventoryInfo();
    }
  }, [match]);
  console.log(inventoryInfo);
  const hasEnoughInventory =
    inventoryInfo && inventoryInfo.totalQuantity >= quantity;
  const isLowStock = inventoryInfo && inventoryInfo.totalQuantity < 5;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-900">Confirm Sale</h3>
          <p className="text-green-700">
            <span className="font-medium">{quantity}</span> ×{" "}
            <span className="font-medium">{match?.name}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-4 rounded-xl border border-green-200 mb-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      ) : inventoryInfo ? (
        <div className="bg-white p-4 rounded-xl border border-green-200 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  hasEnoughInventory ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="font-medium text-gray-900">
                Stock Available: {inventoryInfo.totalQuantity} units
              </span>
            </div>
            <div className="flex gap-2">
              {hasEnoughInventory && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  ✓ In Stock
                </span>
              )}
              {!hasEnoughInventory && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  ✗ Low Stock
                </span>
              )}
              {isLowStock && hasEnoughInventory && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                  ⚠ Running Low
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-4">
          <p className="text-red-700 font-medium">
            ⚠ Product not found in inventory
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
            hasEnoughInventory
              ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={onConfirm}
          disabled={!hasEnoughInventory}
        >
          {hasEnoughInventory ? "Confirm Sale" : "Insufficient Stock"}
        </button>
        <button
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
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
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
      <div className="h-12 bg-gray-200 rounded-2xl w-48 mx-auto"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

function RetailerSalesPanels({ retailerId }) {
  const [activeTab, setActiveTab] = useState("events");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState([]);

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
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sales Analytics</h2>
          <p className="text-gray-600">Track your sales performance</p>
        </div>
      </div>

      <div className="mb-6 flex border-b border-gray-200">
        <TabButton
          label="Recent Sales"
          active={activeTab === "events"}
          onClick={() => setActiveTab("events")}
        />
        <TabButton
          label="Summary"
          active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        />
      </div>

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
      className={`px-4 py-3 -mb-px border-b-2 font-medium transition-colors ${
        active
          ? "border-purple-500 text-purple-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
    <div className="bg-gray-50 p-4 rounded-2xl mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 h-16 rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No sales found</p>
        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sales.map((s, i) => (
        <div
          key={s._id || i}
          className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{s.productName}</p>
                <p className="text-sm text-gray-600">
                  {s.saleDate
                    ? new Date(s.saleDate).toLocaleDateString()
                    : "Unknown date"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">
                {s.totalAmount != null ? `₹${s.totalAmount.toFixed(2)}` : "-"}
              </p>
              <p className="text-sm text-gray-600">{s.unitsSold} units</p>
            </div>
          </div>
        </div>
      ))}
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

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-100 h-20 rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  if (!summary.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No summary available</p>
        <p className="text-gray-400 text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  const totalUnits = summary.reduce(
    (sum, row) => sum + (row.unitsSold || 0),
    0
  );
  const totalRevenue = summary.reduce(
    (sum, row) => sum + (row.revenue || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <p className="text-blue-600 text-sm font-medium">Total Units Sold</p>
          <p className="text-2xl font-bold text-blue-900">{totalUnits}</p>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <p className="text-green-600 text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-green-900">
            ₹{totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {summary.map((row, i) => {
          const unitPrice =
            row.unitPrice ?? (row.unitsSold ? row.revenue / row.unitsSold : 0);
          return (
            <div
              key={row.productId || i}
              className="bg-gray-50 p-4 rounded-xl border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {row.productName}
                  </p>
                  <p className="text-sm text-gray-600">
                    ₹{unitPrice.toFixed(2)} per unit
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₹{row.revenue.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {row.unitsSold} units sold
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RetailerInventoryPanel({ retailerId }) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await authorizedFetch("/api/retailer/inventory");
      const data = await res.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (e) {
      console.error("Failed to fetch retailer inventory", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [retailerId]);

  // Calculate pagination
  const totalPages = Math.ceil(inventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = inventory.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 h-20 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory Status</h2>
          <p className="text-gray-600">
            Monitor your stock levels ({inventory.length} products)
          </p>
        </div>
      </div>

      {inventory.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-2">
            No inventory available
          </p>
          <p className="text-gray-400 text-sm">
            Purchase products to start selling
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {currentItems.map((item, i) => (
              <div
                key={item.productId}
                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.orders.length} batch(es) available
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        item.totalQuantity > 10
                          ? "text-green-600"
                          : item.totalQuantity > 5
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.totalQuantity}
                    </p>
                    <p className="text-sm text-gray-600">units</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    {item.orders.slice(0, 2).map((batch, idx) => (
                      <div key={idx} className="text-xs text-gray-500">
                        Batch {idx + 1} {batch.batchId}: {batch.quantity} units
                        {batch.expiryDate && (
                          <span className="ml-2">
                            (Exp:{" "}
                            {new Date(batch.expiryDate).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    ))}
                    {item.orders.length > 2 && (
                      <div className="text-xs text-gray-400">
                        +{item.orders.length - 2} more batches
                      </div>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.totalQuantity > 10
                        ? "bg-green-100 text-green-800"
                        : item.totalQuantity > 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.totalQuantity > 10
                      ? "Well Stocked"
                      : item.totalQuantity > 5
                      ? "Low Stock"
                      : "Critical"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-
                  {Math.min(endIndex, inventory.length)} of {inventory.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? "bg-orange-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AddSales;
