const Purchase = require("../../database/models/purchase-model");
const Retailer = require("../../database/models/retailer-model");

const getTopRetailersForProduct = async (productId) => {
  // Step 1: Get purchases for the product
  const purchases = await Purchase.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: "$retailerId",
        totalPurchased: { $sum: "$quantity" },
      },
    },
  ]);

  // Step 2: Fetch their sales data
  const retailerIds = purchases.map((p) => p._id);

  const retailers = await Retailer.find({
    _id: { $in: retailerIds },
  });

  const results = [];

  for (const retailer of retailers) {
    const purchaseEntry = purchases.find(
      (p) => p._id.toString() === retailer._id.toString()
    );
    const salesEntry = retailer.salesData.find(
      (s) => s.productId.toString() === productId.toString()
    );

    const totalSold = salesEntry?.unitsSold || 0;
    const totalPurchased = purchaseEntry.totalPurchased;

    // Calculate sales efficiency
    const efficiency = totalPurchased ? totalSold / totalPurchased : 0;

    results.push({
      retailer,
      totalPurchased,
      totalSold,
      efficiency,
    });
  }

  // Step 3: Sort by efficiency (and fallback to sold or purchased)
  results.sort((a, b) => {
    return (
      b.efficiency - a.efficiency ||
      b.totalSold - a.totalSold ||
      b.totalPurchased - a.totalPurchased
    );
  });

  return results.slice(0, 5); // Return top 5
};

module.exports = getTopRetailersForProduct;
