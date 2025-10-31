const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Cart = require("../../database/models/cart-model");
const Retailer = require("../../database/models/retailer-model");
const Order = require("../../database/models/order-pay-model");
const Purchase = require("../../database/models/purchase-model");
const Inventory = require("../../database/models/inventory-model");
const Product = require("../../database/models/product-model");

const {
  createCheckoutSession,
  verifyWebhook,
} = require("../services/stripeService");

// -------------------- Checkout --------------------
const checkout = async (req, res) => {
  try {
    const userId = req.userInfo?.userId;
    const retailer = await Retailer.findOne({ userId });
    if (!retailer)
      return res
        .status(404)
        .json({ success: false, message: "Retailer not found" });

    const cart = await Cart.findOne({ retailerId: retailer._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const session = await createCheckoutSession(cart, retailer);
    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ success: false, error: "Checkout failed" });
  }
};

// -------------------- Webhook --------------------
const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const event = verifyWebhook(sig, req.body);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Payment success for session:", session.id);

      const existingOrder = await Order.findOne({
        stripeSessionId: session.id,
      });
      if (existingOrder) {
        console.log("⚠️ Order already processed for this session:", session.id);
        return res.status(200).json({ received: true });
      }

      const cart = await Cart.findById(session.client_reference_id).populate(
        "retailerId"
      );
      if (!cart) {
        console.error("❌ Cart not found for ID:", session.client_reference_id);
        return res.status(404).json({ error: "Cart not found" });
      }

      const retailer = cart.retailerId;

      const subtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      let discount = 0;
      if (cart.promoCode === "DISCOUNT10") discount = subtotal * 0.1;

      const finalAmount = subtotal - discount + (cart.shippingCost || 0);
      const order = new Order({
        retailerId: retailer._id,
        items: cart.items,
        totalAmount: subtotal,
        shippingMethod: cart.shippingMethod,
        shippingCost: cart.shippingCost,
        promoCode: cart.promoCode,
        discount,
        finalAmount,
        currency: "inr",
        paymentStatus: "paid",
        orderStatus: "processing",
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
      });
      await order.save();

      // 🧾 Create Stripe Invoice for the order
      try {
        const customerEmail = retailer.email || "unknown@example.com";

        // 1️⃣ Create or find Stripe Customer
        let customerId;
        const existingCustomers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        if (existingCustomers.data.length > 0) {
          customerId = existingCustomers.data[0].id;
        } else {
          const newCustomer = await stripe.customers.create({
            email: customerEmail,
            name: retailer.retailerName || "Retailer",
            metadata: { retailerId: retailer._id.toString() },
          });
          customerId = newCustomer.id;
        }

        // 2️⃣ Create invoice item
        await stripe.invoiceItems.create({
          customer: customerId,
          amount: Math.round(finalAmount * 100), // amount in paise
          currency: "inr",
          description: `Order #${order._id} — ${cart.items.length} items`,
        });

        // 3️⃣ Create and finalize invoice
        const invoice = await stripe.invoices.create({
          customer: customerId,
          collection_method: "send_invoice",
          days_until_due: 0,
          metadata: { orderId: order._id.toString() },
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(
          invoice.id
        );

        // 4️⃣ Save invoice details to your Order model
        order.stripeInvoiceId = finalizedInvoice.id;
        order.invoicePdf = finalizedInvoice.invoice_pdf;
        order.invoiceUrl = finalizedInvoice.hosted_invoice_url;
        await order.save();

        console.log("✅ Stripe Invoice created:", finalizedInvoice.id);
      } catch (invoiceErr) {
        console.error("⚠️ Error creating Stripe invoice:", invoiceErr.message);
      }

      // 📦 Deduct inventory for each item
      for (const item of cart.items) {
        let qtyToFulfill = item.quantity;

        const availableInventory = await Inventory.find({
          productId: item.productId,
          currentStatus: "in_inventory",
          assignedRetailer: null,
        }).sort({ expiryDate: 1 });

        for (const inv of availableInventory) {
          if (qtyToFulfill <= 0) break;

          const deduct = Math.min(inv.quantity, qtyToFulfill);
          inv.quantity -= deduct;

          if (inv.quantity === 0) {
            inv.currentStatus = "sold";
          }
          await inv.save();

          qtyToFulfill -= deduct;
        }
      }

      const purchase = new Purchase({
        retailerId: retailer._id,
        retailerName: retailer.retailerName,
        orders: await Promise.all(
          cart.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            return {
              productId: item.productId,
              productName: item.name,
              quantity: item.quantity,
              totalPrice: item.price * item.quantity,
              imageUrl: product?.imageUrl || null,
              status: "completed",
            };
          })
        ),
      });
      await purchase.save();

      // 🧹 Clear cart
      cart.items = [];
      cart.promoCode = null;
      await cart.save();

      console.log(
        "✅ Order & Purchase created, inventory deducted, cart cleared:",
        order._id
      );
    }

    res.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

// -------------------- Get Stripe Invoice --------------------
const getStripeInvoice = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const order = await Order.findOne({ stripeSessionId: sessionId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    let invoice;

    if (order.stripeInvoiceId) {
      invoice = await stripe.invoices.retrieve(order.stripeInvoiceId);
    } else {
      return res.status(404).json({
        success: false,
        message: "No Stripe invoice found for this order.",
      });
    }

    res.json({
      success: true,
      invoice: {
        number: invoice.number,
        customer_name: invoice.customer_name,
        status: invoice.status,
        amount_due: invoice.amount_due,
        hosted_invoice_url: invoice.hosted_invoice_url,
        invoice_pdf: invoice.invoice_pdf,
      },
    });
  } catch (err) {
    console.error("❌ getStripeInvoice error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  checkout,
  handleWebhook,
  getStripeInvoice,
};
