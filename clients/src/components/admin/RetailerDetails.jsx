const RetailerDetails = () => {
  const retailers = [
    {
      id: 1,
      name: "TechMart",
      email: "contact@techmart.com",
      phone: "+1-555-0123",
      address: "123 Tech Street, Silicon Valley, CA",
      totalOrders: 15,
      totalSpent: 45000,
    },
    {
      id: 2,
      name: "FreshGrocer",
      email: "info@freshgrocer.com",
      phone: "+1-555-0456",
      address: "456 Fresh Ave, Green City, NY",
      totalOrders: 32,
      totalSpent: 12500,
    },
    {
      id: 3,
      name: "BookWorld",
      email: "books@bookworld.com",
      phone: "+1-555-0789",
      address: "789 Book Lane, Literary Town, TX",
      totalOrders: 8,
      totalSpent: 3200,
    },
    {
      id: 4,
      name: "ElectroStore",
      email: "sales@electrostore.com",
      phone: "+1-555-0321",
      address: "321 Electric Blvd, Current City, FL",
      totalOrders: 22,
      totalSpent: 67800,
    },
    {
      id: 5,
      name: "CoffeeHub",
      email: "hello@coffeehub.com",
      phone: "+1-555-0654",
      address: "654 Coffee St, Bean Town, WA",
      totalOrders: 45,
      totalSpent: 18900,
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Retailer Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {retailers.map((retailer) => (
          <div
            key={retailer.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {retailer.name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Email:</span> {retailer.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {retailer.phone}
              </p>
              <p>
                <span className="font-medium">Address:</span> {retailer.address}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Orders:</span>
                <span className="font-semibold text-blue-600">
                  {retailer.totalOrders}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Total Spent:</span>
                <span className="font-semibold text-green-600">
                  ${retailer.totalSpent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RetailerDetails;
