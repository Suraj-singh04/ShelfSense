import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authorizedFetch } from "../../../utils/api";

const InvoicePage = () => {
  const location = useLocation();
  const order = location.state?.order;

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!order?.stripeSessionId) {
          setError("Stripe session not found for this order.");
          setLoading(false);
          return;
        }

        console.log("Fetching invoice for session:", order.stripeSessionId);

        const res = await authorizedFetch(
          `/api/payment/invoice/${order.stripeSessionId}`
        );
        const data = await res.json();

        if (data.success) {
          setInvoice(data.invoice);
        } else {
          setError(data.message || "Failed to fetch invoice.");
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("An unexpected error occurred while fetching the invoice.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [order?.stripeSessionId]); // ✅ Fix dependency warning

  // 🌀 Loading state
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-indigo-600">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <p>Loading invoice...</p>
      </div>
    );

  // ❌ Error state
  if (error)
    return (
      <div className="text-center text-red-600 mt-10">
        <p>{error}</p>
      </div>
    );

  // ℹ️ No invoice found
  if (!invoice)
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>No invoice found for this order.</p>
      </div>
    );

  // ✅ Render invoice details
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-indigo-100">
        <h2 className="text-3xl font-bold text-indigo-700 mb-6">
          Invoice #{invoice.number || "N/A"}
        </h2>

        <div className="space-y-4 text-gray-700">
          <p>
            <span className="font-semibold text-gray-900">Customer:</span>{" "}
            {invoice.customer_name || "N/A"}
          </p>
          <p>
            <span className="font-semibold text-gray-900">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded-md text-sm font-medium ${
                invoice.status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {invoice.status?.toUpperCase() || "UNKNOWN"}
            </span>
          </p>
          <p className="text-lg">
            <span className="font-semibold text-gray-900">Total:</span>{" "}
            <span className="text-indigo-700 font-bold">
              ₹{order.finalAmount.toFixed(2)}
            </span>
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          {invoice.hosted_invoice_url && (
            <a
              href={invoice.hosted_invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow"
            >
              View on Stripe
            </a>
          )}
          {invoice.invoice_pdf && (
            <a
              href={invoice.invoice_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Download PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
