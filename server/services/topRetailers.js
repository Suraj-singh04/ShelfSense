const mongoose = require("mongoose");
const Purchase = require("../../database/models/purchase-model");
const Retailer = require("../../database/models/retailer-model");

const getTopRetailersForProduct = async (productId) => {
  const pid = new mongoose.Types.ObjectId(productId);

  const purchases = await Purchase.aggregate([
    { $unwind: "$orders" },
    { $match: { "orders.productId": pid } },
    {
      $group: {
        _id: "$retailerId",
        totalPurchased: { $sum: "$orders.quantity" },
      },
    },
  ]);
  console.log(
    "[TOP-Retailers] productId:",
    productId.toString(),
    "agg result:",
    purchases
  );

  if (!purchases.length) return [];

  const retailerIds = purchases.map((p) => p._id);
  const retailers = await Retailer.find({ _id: { $in: retailerIds } });

  const results = [];

  for (const retailer of retailers) {
    const purchaseEntry = purchases.find(
      (p) => p._id.toString() === retailer._id.toString()
    );

    const totalSold = retailer.salesData
      .filter((s) => s.productId.toString() === productId.toString())
      .reduce((acc, s) => acc + s.unitsSold, 0);
    console.log(`[TOP-Retailers] retailer=${retailer.name} sold=${totalSold}`);
    if (totalSold === 0) continue;

    const totalPurchased = purchaseEntry?.totalPurchased ?? 0;
    const efficiency = totalPurchased ? totalSold / totalPurchased : 0;

    results.push({
      retailer,
      totalPurchased,
      totalSold,
      efficiency,
    });
  }

  results.sort(
    (a, b) =>
      b.efficiency - a.efficiency ||
      b.totalSold - a.totalSold ||
      b.totalPurchased - a.totalPurchased
  );

  return results.slice(0, 5);
};

module.exports = getTopRetailersForProduct;
