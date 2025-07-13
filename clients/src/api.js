const API_BASE = "http://localhost:3000";

// Authentication
export const loginUser = async (credentials) =>
  fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  }).then((r) => r.json());

export const signupUser = async (userData) =>
  fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  }).then((r) => r.json());

export const logoutUser = async () =>
  fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
  }).then((r) => r.json());

// Retailers
export const getRetailers = async () =>
  fetch(`${API_BASE}/retailer`).then((r) => r.json());
export const addRetailer = async (data) =>
  fetch(`${API_BASE}/retailer/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
export const addSalesData = async (retailerId, data) =>
  fetch(`${API_BASE}/retailer/${retailerId}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
export const getRetailerOrders = async (retailerId) =>
  fetch(`${API_BASE}/retailer/${retailerId}/orders`).then((r) => r.json());

// Products
export const getProducts = async () =>
  fetch(`${API_BASE}/product/get`).then((r) => r.json());
export const addProduct = async (data) =>
  fetch(`${API_BASE}/product/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
export const searchProducts = async (name) =>
  fetch(`${API_BASE}/product/search?name=${encodeURIComponent(name)}`).then(
    (r) => r.json()
  );

// Inventory
export const getInventory = async () =>
  fetch(`${API_BASE}/inventory/get`).then((r) => r.json());
export const addInventory = async (data) =>
  fetch(`${API_BASE}/inventory/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// Orders
export const addOrder = async (data) =>
  fetch(`${API_BASE}/purchase/buy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

// Suggestions
export const getSuggestions = async (retailerId) =>
  fetch(`${API_BASE}/suggestions/retailer/${retailerId}`).then((r) => r.json());
export const confirmSuggestion = async (suggestionId) =>
  fetch(`${API_BASE}/suggestions/confirm/${suggestionId}`, {
    method: "POST",
  }).then((r) => r.json());
export const rejectSuggestion = async (suggestionId) =>
  fetch(`${API_BASE}/suggestions/reject/${suggestionId}`, {
    method: "POST",
  }).then((r) => r.json());

// Smart Routing
export const getSmartRoutingSuggestions = async () =>
  fetch(`${API_BASE}/smart-routing/getSuggestions`).then((r) => r.json());
