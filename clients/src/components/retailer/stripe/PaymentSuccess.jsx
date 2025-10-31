import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/session/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold text-green-700 mb-2">
        Payment Successful 🎉
      </h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been placed.
      </p>

      {order && (
        <div className="bg-white shadow rounded-2xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between py-2">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <hr className="my-3" />
          <p className="flex justify-between font-bold">
            Total <span>₹{order.finalAmount}</span>
          </p>
        </div>
      )}

      <a
        href="/"
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Continue Shopping
      </a>
    </div>
  );
}
