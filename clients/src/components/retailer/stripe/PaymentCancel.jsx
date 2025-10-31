import { XCircle } from "lucide-react";

export default function PaymentCancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <XCircle className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-2xl font-bold text-red-700 mb-2">
        Payment Cancelled ❌
      </h1>
      <p className="text-gray-600 mb-6">
        Your payment was not completed. You can try again anytime.
      </p>
      <a
        href="/cart"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
      >
        Back to Cart
      </a>
    </div>
  );
}
