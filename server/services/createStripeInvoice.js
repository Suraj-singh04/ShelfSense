const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../../database/models/order-pay-model");

const createStripeInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order || !order.stripeCustomerId) {
      return res
        .status(404)
        .json({ success: false, message: "Order or customer not found" });
    }

    // 1️⃣ Create invoice item (line item)
    await stripe.invoiceItems.create({
      customer: order.stripeCustomerId,
      amount: Math.round(order.totalAmount * 100), // amount in cents
      currency: "inr",
      description: `Invoice for Order #${order._id}`,
    });

    // 2️⃣ Create the invoice
    const invoice = await stripe.invoices.create({
      customer: order.stripeCustomerId,
      collection_method: "send_invoice",
      days_until_due: 0,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    // 3️⃣ Finalize and send invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    res.json({
      success: true,
      invoice: {
        id: finalizedInvoice.id,
        number: finalizedInvoice.number,
        hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
        invoice_pdf: finalizedInvoice.invoice_pdf,
        amount_due: finalizedInvoice.amount_due,
        status: finalizedInvoice.status,
      },
    });
  } catch (err) {
    console.error("❌ Error creating invoice:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = createStripeInvoice;
