import { useState, useEffect } from "react";
import { authorizedFetch } from "../../utils/api";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await authorizedFetch("/api/cart/");
        const data = await res.json();
        setCart(data.data);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };
    fetchCart();
  }, []);

  const updateQuantity = async (productId, action) => {
    try {
      const res = await authorizedFetch("/api/cart/update", {
        method: "PUT",
        body: JSON.stringify({ productId, action }),
      });
      const data = await res.json();
      setCart(data.data);
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const applyPromo = async () => {
    try {
      const res = await authorizedFetch("/api/cart/apply-promo", {
        method: "POST",
        body: JSON.stringify({ code: promoCode }),
      });

      const data = await res.json();
      setCart(data.data);
    } catch (err) {
      console.error("Error applying promo:", err);
    }
  };

  const checkout = async () => {
    try {
      const res = await authorizedFetch("/api/payment/checkout", {
        method: "POST",
        body: JSON.stringify({ cartId: cart._id }),
      });

      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error("Error during checkout:", err);
    }
  };

  if (!cart) return <p>Loading...</p>;

  // 🛒 If cart is empty
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600">
          Browse products and add them to your cart.
        </p>
      </div>
    );
  }

  // 🛒 If cart has items
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Left Side - Cart Items */}
      <div className="col-span-2 bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
        {cart.items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b py-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <p className="font-medium">{item.name}</p>
                <button
                  onClick={() => updateQuantity(item.productId, "remove")}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, "decrease")}
                className="px-2 py-1 border rounded"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, "increase")}
                className="px-2 py-1 border rounded"
              >
                +
              </button>
            </div>

            <p>₹{item.price}</p>
            <p className="font-semibold">₹{item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      {/* Right Side - Order Summary */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <p className="flex justify-between">
          Items {cart.items.length}{" "}
          <span>
            ₹{cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)}
          </span>
        </p>
        <p className="flex justify-between">
          Shipping <span>₹{cart.shippingCost}</span>
        </p>

        {/* Promo Code */}
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="border px-3 py-2 w-full rounded mb-2"
          />
          <button
            onClick={applyPromo}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Apply
          </button>
        </div>

        <hr className="my-4" />
        <p className="flex justify-between font-bold text-lg">
          Total Cost <span>₹{cart.total ?? 0}</span>
        </p>

        <button
          onClick={checkout}
          className="bg-blue-600 text-white w-full py-3 rounded mt-4"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}
