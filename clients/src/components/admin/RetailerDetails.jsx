import { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";
import { Mail, Phone, MapPin, ShoppingBag, Wallet, Star } from "lucide-react";

const RetailerDetails = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRetailers = async () => {
    try {
      const res = await authorizedFetch("/api/retailer/stats");
      const data = await res.json();
      if (res.ok) {
        setRetailers(data.retailers || []);
      } else {
        console.error("Failed to fetch retailers");
      }
    } catch (err) {
      console.error("Error fetching retailers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading retailers...</div>;
  }

  const topRetailers = [...retailers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 3)
    .map((r) => r._id);

  return (
    <div className="p-6 bg-gray-900/70 border border-gray-700 min-h-screen">
      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400 mb-8 flex items-center gap-2">
        Retailer Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {retailers.map((retailer, index) => (
          <div
            key={retailer._id}
            className={`relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-800 shadow-md hover:shadow-2xl `}
          >
            {/* Top Ribbon */}
            {topRetailers.includes(retailer._id) && (
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-3 py-1 font-bold rounded-bl-lg flex items-center gap-1 shadow-lg">
                <Star size={14} />
                Top
              </div>
            )}

            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
              <h3 className="text-lg font-semibold truncate">
                {retailer.name}
              </h3>
              <p className="text-sm text-white/80 truncate">{retailer.email}</p>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-3 text-gray-300">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-indigo-400" />
                <span>{retailer.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-400" />
                <span>{retailer.address}</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-indigo-900/60 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-lg transition-all duration-300">
                  <ShoppingBag size={18} className="text-indigo-300 mb-1" />
                  <span className="text-sm text-gray-400">Orders</span>
                  <span className="font-bold text-lg text-white">
                    {retailer.totalOrders}
                  </span>
                </div>
                <div className="bg-green-900/60 rounded-xl p-4 flex flex-col items-center shadow hover:shadow-lg transition-all duration-300">
                  <Wallet size={18} className="text-green-300 mb-1" />
                  <span className="text-sm text-gray-400">Total Spent</span>
                  <span className="font-bold text-lg text-white">
                    ₹{retailer.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-700 p-4 border-t border-gray-600 flex justify-between items-center text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>{retailer.email}</span>
              </div>
              <div className="text-xs text-gray-500">Retailer #{index + 1}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetailerDetails;
