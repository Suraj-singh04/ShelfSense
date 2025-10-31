// services/stripeService.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function createCheckoutSession(cart, retailer) {
  // constructEvent is synchronous, so verifyWebhook below won’t be async
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: retailer.email,

    // ✅ Tie the session to your cart
    client_reference_id: cart._id.toString(),
    // 👌 also helpful if you need it later:
    metadata: { retailerId: retailer._id.toString() },

    line_items: cart.items.map((item) => ({
      price_data: {
        currency: "inr", // ✅ INR
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // ✅ rupees → paise
      },
      quantity: item.quantity,
    })),

    shipping_options: [
      {
        shipping_rate_data: {
          display_name: cart.shippingMethod || "Standard Shipping",
          type: "fixed_amount",
          fixed_amount: {
            amount: Math.round((cart.shippingCost || 0) * 100), // ✅ paise
            currency: "inr",
          },
        },
      },
    ],

    // Use the SAME paths you route on the frontend:
    success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });
}

// keep this synchronous wrapper (Stripe SDK call is sync)
function verifyWebhook(signature, payloadBuffer) {
  return stripe.webhooks.constructEvent(
    payloadBuffer,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

module.exports = { createCheckoutSession, verifyWebhook };
