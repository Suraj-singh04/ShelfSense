const API_BASE = "http://localhost:3000";

// Mock data for frontend development
const MOCK_DATA = {
  products: [
    { id: 1, name: "Amul Milk", category: "Dairy", price: 25 },
    { id: 2, name: "Britannia Bread", category: "Bakery", price: 35 },
    { id: 3, name: "Horlicks", category: "Beverages", price: 150 },
    { id: 4, name: "Dettol Soap", category: "Personal Care", price: 45 },
    { id: 5, name: "Atta", category: "Grains", price: 60 }
  ],
  orders: [
    { id: 1, productName: "Amul Milk", quantity: 10, date: "2024-01-15", status: "Delivered" },
    { id: 2, productName: "Britannia Bread", quantity: 5, date: "2024-01-14", status: "Pending" },
    { id: 3, productName: "Horlicks", quantity: 2, date: "2024-01-13", status: "Delivered" }
  ],
  suggestions: [
    { id: 1, productName: "Amul Milk", suggestedQuantity: 15, reason: "High demand" },
    { id: 2, productName: "Dettol Soap", suggestedQuantity: 8, reason: "Low stock" }
  ],
  retailers: [
    { id: 1, name: "Store A", location: "Mumbai", status: "Active" },
    { id: 2, name: "Store B", location: "Delhi", status: "Active" },
    { id: 3, name: "Store C", location: "Bangalore", status: "Inactive" }
  ],
  purchases: [
    { id: 1, retailerName: "Store A", productName: "Amul Milk", quantity: 20, date: "2024-01-15" },
    { id: 2, retailerName: "Store B", productName: "Britannia Bread", quantity: 15, date: "2024-01-14" }
  ]
};

// Flag to enable/disable mock mode
const USE_MOCK_DATA = false;

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API request handler with error handling
const apiRequest = async (endpoint, options = {}) => {
  // If using mock data, return mock responses
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock data based on endpoint
    if (endpoint.includes('/product/get')) {
      return { success: true, data: MOCK_DATA.products };
    }
    if (endpoint.includes('/retailer/orders')) {
      return { success: true, data: MOCK_DATA.orders };
    }
    if (endpoint.includes('/suggestions/retailer')) {
      return { success: true, data: MOCK_DATA.suggestions };
    }
    if (endpoint.includes('/admin/retailers')) {
      return { success: true, data: MOCK_DATA.retailers };
    }
    if (endpoint.includes('/purchase/get')) {
      return { success: true, data: MOCK_DATA.purchases };
    }
    if (endpoint.includes('/retailer/available-products')) {
      return { success: true, data: MOCK_DATA.products };
    }
    
    // Default mock response
    return { success: true, data: [] };
  }

  try {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    console.error('API Request Error:', error);
    return { 
      success: false, 
      error: error.message || 'An error occurred while making the request' 
    };
  }
};

// Authentication APIs
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};

// Retailer APIs
export const retailerAPI = {
  getAvailableProducts: async () => {
    return apiRequest('/retailer/available-products');
  },

  addSalesData: async (data) => {
    return apiRequest('/retailer/sales', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getOrders: async () => {
    return apiRequest('/retailer/orders');
  },

  placeOrder: async (data) => {
    return apiRequest('/retailer/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Product APIs
export const productAPI = {
  getAll: async () => {
    return apiRequest('/product/get');
  },

  add: async (data) => {
    return apiRequest('/product/add', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  search: async (name) => {
    return apiRequest(`/product/search?name=${encodeURIComponent(name)}`);
  }
};

// Inventory APIs
export const inventoryAPI = {
  getAll: async () => {
    return apiRequest('/inventory/get');
  },

  add: async (data) => {
    return apiRequest('/inventory/add', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Purchase/Order APIs
export const purchaseAPI = {
  create: async (data) => {
    return apiRequest('/purchase/buy', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  
  getAll: async () => {
    return apiRequest('/purchase/get');
  }
};

// Suggestion APIs
export const suggestionAPI = {
  getRetailerSuggestions: async () => {
    return apiRequest('/suggestions/retailer');
  },

  confirm: async (suggestionId) => {
    return apiRequest(`/suggestions/confirm/${suggestionId}`, {
      method: 'POST'
    });
  },

  reject: async (suggestionId) => {
    return apiRequest(`/suggestions/reject/${suggestionId}`, {
      method: 'POST'
    });
  }
};

// Smart Routing APIs
export const smartRoutingAPI = {
  getSuggestions: async () => {
    return apiRequest('/smart-routing/getSuggestions');
  }
};

// Admin APIs
export const adminAPI = {
  getRetailers: async () => {
    return apiRequest('/admin/retailers');
  },

  assignToRetailer: async (data) => {
    return apiRequest('/assign/assign', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin-specific suggestion management
  getAllSuggestions: async () => {
    return apiRequest('/admin/suggestions');
  },

  // Admin product management
  addProduct: async (data) => {
    return apiRequest('/product/add', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin inventory management
  addInventoryItem: async (data) => {
    return apiRequest('/inventory/add', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Get all products for admin
  getAllProducts: async () => {
    return apiRequest('/product/get');
  },

  // Get all inventory for admin
  getAllInventory: async () => {
    return apiRequest('/inventory/get');
  }
};

// Legacy exports for backward compatibility
export const loginUser = authAPI.login;
export const signupUser = authAPI.register;
export const getRetailers = adminAPI.getRetailers;
export const addSalesData = retailerAPI.addSalesData;
export const getAvailableProducts = retailerAPI.getAvailableProducts;
export const getRetailerOrders = retailerAPI.getOrders;
export const getProducts = productAPI.getAll;
export const addProduct = productAPI.add;
export const searchProducts = productAPI.search;
export const getInventory = inventoryAPI.getAll;
export const addInventory = inventoryAPI.add;
export const addOrder = purchaseAPI.create;
export const getSuggestions = suggestionAPI.getRetailerSuggestions;
export const confirmSuggestion = suggestionAPI.confirm;
export const rejectSuggestion = suggestionAPI.reject;
export const getSmartRoutingSuggestions = smartRoutingAPI.getSuggestions;
