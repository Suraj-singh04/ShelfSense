import { useEffect, useState } from "react";
import { authorizedFetch } from "../../utils/api";
import { Mail, Phone, MapPin, ShoppingBag, Wallet } from "lucide-react";

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
    return <div className="p-6 text-gray-600">Loading retailers...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        Retailer Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {retailers.map((retailer) => (
          <div
            key={retailer._id}
            className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
              <h3 className="text-lg font-semibold truncate">
                {retailer.name}
              </h3>
              <p className="text-sm text-white/80">{retailer.email}</p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 text-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500" />
                <span>{retailer.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-400" />
                <span>{retailer.address}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-5 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <ShoppingBag size={16} />
                <span>{retailer.totalOrders} orders</span>
              </div>
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <Wallet size={16} />
                <span>₹{retailer.totalSpent.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetailerDetails;
