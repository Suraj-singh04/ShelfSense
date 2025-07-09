const Retailer = require("../../database/models/retailer-model");

const notifyRetailer = async (retailerId, message) => {
  const retailer = await Retailer.findById(retailerId);
  if (!retailer) {
    console.log(`❌ Retailer ${retailerId} not found`);
    return;
  }

  console.log(
    `📩 Notification to ${retailer.name} (${retailer._id}): ${message}`
  );

  //integrate Twilio, SendGrid, Firebase
};

module.exports = notifyRetailer;
