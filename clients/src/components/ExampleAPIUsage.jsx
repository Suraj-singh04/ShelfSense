import React, { useState, useEffect } from 'react';
import { retailerAPI, productAPI, suggestionAPI } from '../api';

/**
 * Example component demonstrating proper API usage patterns
 * This shows how to use the new centralized API structure
 */
const ExampleAPIUsage = () => {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Example of fetching multiple resources
      const [productsResponse, suggestionsResponse] = await Promise.all([
        retailerAPI.getAvailableProducts(),
        suggestionAPI.getRetailerSuggestions()
      ]);

      // Handle products response
      if (productsResponse.success) {
        setProducts(productsResponse.data.data || []);
      } else {
        console.error('Failed to load products:', productsResponse.error);
      }

      // Handle suggestions response
      if (suggestionsResponse.success) {
        setSuggestions(suggestionsResponse.data.data || []);
      } else {
        console.error('Failed to load suggestions:', suggestionsResponse.error);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          API Integration Example
        </h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            📦 Available Products ({products.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No products available</p>
            ) : (
              products.map((product) => (
                <div
                  key={product._id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Quantity: {product.totalQuantity}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Suggestions Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            💡 Smart Suggestions ({suggestions.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {suggestions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No suggestions available</p>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                >
                  <p className="font-medium">{suggestion.product?.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Quantity: {suggestion.quantity} | Reason: {suggestion.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* API Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
          💡 How to use the API:
        </h4>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>1. Import the API you need: <code>import {`{ retailerAPI }`} from '../api'</code></p>
          <p>2. Use async/await with proper error handling</p>
          <p>3. Check <code>response.success</code> before using data</p>
          <p>4. Access data via <code>response.data</code></p>
          <p>5. Handle errors via <code>response.error</code></p>
        </div>
      </div>
    </div>
  );
};

export default ExampleAPIUsage; 