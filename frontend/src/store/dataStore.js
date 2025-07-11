/**
 * Data Store
 * Zustand store for managing application data (products, orders, customers, etc.)
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import productService from '../services/api/productService.js';
import orderService from '../services/api/orderService.js';
import customerService from '../services/api/customerService.js';
import inventoryService from '../services/api/inventoryService.js';

/**
 * Data Store
 * Manages application data with caching, real-time updates, and optimistic updates
 */
const useDataStore = create(
  subscribeWithSelector((set, get) => ({
    // Products
    products: [],
    productsLoading: false,
    productsError: null,
    productsPagination: { page: 1, limit: 20, total: 0 },
    productsFilters: {},
    
    // Orders
    orders: [],
    ordersLoading: false,
    ordersError: null,
    ordersPagination: { page: 1, limit: 20, total: 0 },
    ordersFilters: {},
    
    // Customers
    customers: [],
    customersLoading: false,
    customersError: null,
    customersPagination: { page: 1, limit: 20, total: 0 },
    customersFilters: {},
    
    // Inventory
    inventory: [],
    inventoryLoading: false,
    inventoryError: null,
    inventoryPagination: { page: 1, limit: 20, total: 0 },
    inventoryFilters: {},
    
    // Categories
    categories: [],
    categoriesLoading: false,
    
    // Cache management
    cache: {},
    cacheExpiry: {},
    
    // Real-time data
    realTimeMetrics: {},
    lastUpdate: null,

    // Product Actions
    /**
     * Fetch products with pagination and filters
     * @param {Object} params - Query parameters
     */
    fetchProducts: async (params = {}) => {
      set({ productsLoading: true, productsError: null });
      
      try {
        const response = await productService.getProducts(params);
        
        if (response.success) {
          set({
            products: response.data,
            productsPagination: response.pagination,
            productsLoading: false,
            productsFilters: params
          });
          
          // Cache the results
          get().setCacheData('products', response.data, 5 * 60 * 1000); // 5 minutes
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        set({
          productsLoading: false,
          productsError: error.message
        });
      }
    },

    /**
     * Add new product
     * @param {Object} productData - Product data
     */
    addProduct: async (productData) => {
      try {
        const response = await productService.createProduct(productData);
        
        if (response.success) {
          // Optimistic update
          set((state) => ({
            products: [response.data, ...state.products]
          }));
          
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Update product
     * @param {string} productId - Product ID
     * @param {Object} productData - Updated product data
     */
    updateProduct: async (productId, productData) => {
      try {
        const response = await productService.updateProduct(productId, productData);
        
        if (response.success) {
          // Optimistic update
          set((state) => ({
            products: state.products.map(product =>
              product.id === productId ? { ...product, ...response.data } : product
            )
          }));
          
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    /**
     * Delete product
     * @param {string} productId - Product ID
     */
    deleteProduct: async (productId) => {
      try {
        const response = await productService.deleteProduct(productId);
        
        if (response.success) {
          // Optimistic update
          set((state) => ({
            products: state.products.filter(product => product.id !== productId)
          }));
          
          return { success: true };
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Order Actions
    /**
     * Fetch orders with pagination and filters
     * @param {Object} params - Query parameters
     */
    fetchOrders: async (params = {}) => {
      set({ ordersLoading: true, ordersError: null });
      
      try {
        const response = await orderService.getOrders(params);
        
        if (response.success) {
          set({
            orders: response.data,
            ordersPagination: response.pagination,
            ordersLoading: false,
            ordersFilters: params
          });
          
          // Cache the results
          get().setCacheData('orders', response.data, 2 * 60 * 1000); // 2 minutes
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        set({
          ordersLoading: false,
          ordersError: error.message
        });
      }
    },

    /**
     * Create new order
     * @param {Object} orderData - Order data
     */
    createOrder: async (orderData) => {
      try {
        const response = await orderService.createOrder(orderData);
        
        if (response.success) {
          // Optimistic update
          set((state) => ({
            orders: [response.data, ...state.orders]
          }));
          
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Customer Actions
    /**
     * Fetch customers with pagination and filters
     * @param {Object} params - Query parameters
     */
    fetchCustomers: async (params = {}) => {
      set({ customersLoading: true, customersError: null });
      
      try {
        const response = await customerService.getCustomers(params);
        
        if (response.success) {
          set({
            customers: response.data,
            customersPagination: response.pagination,
            customersLoading: false,
            customersFilters: params
          });
          
          // Cache the results
          get().setCacheData('customers', response.data, 10 * 60 * 1000); // 10 minutes
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        set({
          customersLoading: false,
          customersError: error.message
        });
      }
    },

    // Inventory Actions
    /**
     * Fetch inventory with pagination and filters
     * @param {Object} params - Query parameters
     */
    fetchInventory: async (params = {}) => {
      set({ inventoryLoading: true, inventoryError: null });
      
      try {
        const response = await inventoryService.getInventory(params);
        
        if (response.success) {
          set({
            inventory: response.data,
            inventoryPagination: response.pagination,
            inventoryLoading: false,
            inventoryFilters: params
          });
          
          // Cache the results
          get().setCacheData('inventory', response.data, 5 * 60 * 1000); // 5 minutes
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        set({
          inventoryLoading: false,
          inventoryError: error.message
        });
      }
    },

    /**
     * Update stock quantity
     * @param {string} productId - Product ID
     * @param {Object} stockData - Stock update data
     */
    updateStock: async (productId, stockData) => {
      try {
        const response = await inventoryService.updateStock(productId, stockData);
        
        if (response.success) {
          // Update inventory in store
          set((state) => ({
            inventory: state.inventory.map(item =>
              item.product_id === productId ? { ...item, ...response.data } : item
            )
          }));
          
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Categories Actions
    /**
     * Fetch product categories
     */
    fetchCategories: async () => {
      set({ categoriesLoading: true });
      
      try {
        const response = await productService.getCategories();
        
        if (response.success) {
          set({
            categories: response.data,
            categoriesLoading: false
          });
          
          // Cache categories for longer
          get().setCacheData('categories', response.data, 30 * 60 * 1000); // 30 minutes
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        set({ categoriesLoading: false });
      }
    },

    // Cache Management
    /**
     * Set cache data with expiry
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    setCacheData: (key, data, ttl = 5 * 60 * 1000) => {
      const expiry = Date.now() + ttl;
      set((state) => ({
        cache: { ...state.cache, [key]: data },
        cacheExpiry: { ...state.cacheExpiry, [key]: expiry }
      }));
    },

    /**
     * Get cache data if not expired
     * @param {string} key - Cache key
     * @returns {any} Cached data or null
     */
    getCacheData: (key) => {
      const { cache, cacheExpiry } = get();
      const expiry = cacheExpiry[key];
      
      if (expiry && Date.now() < expiry) {
        return cache[key];
      }
      
      return null;
    },

    /**
     * Clear cache data
     * @param {string} key - Cache key (optional, clears all if not provided)
     */
    clearCache: (key) => {
      if (key) {
        set((state) => {
          const newCache = { ...state.cache };
          const newExpiry = { ...state.cacheExpiry };
          delete newCache[key];
          delete newExpiry[key];
          return { cache: newCache, cacheExpiry: newExpiry };
        });
      } else {
        set({ cache: {}, cacheExpiry: {} });
      }
    },

    // Real-time Updates
    /**
     * Update real-time metrics
     * @param {Object} metrics - Real-time metrics data
     */
    updateRealTimeMetrics: (metrics) => {
      set({
        realTimeMetrics: { ...get().realTimeMetrics, ...metrics },
        lastUpdate: Date.now()
      });
    },

    // Utility Actions
    /**
     * Refresh all data
     */
    refreshAllData: async () => {
      const { productsFilters, ordersFilters, customersFilters, inventoryFilters } = get();
      
      await Promise.all([
        get().fetchProducts(productsFilters),
        get().fetchOrders(ordersFilters),
        get().fetchCustomers(customersFilters),
        get().fetchInventory(inventoryFilters),
        get().fetchCategories()
      ]);
    },

    /**
     * Reset all data
     */
    resetData: () => {
      set({
        products: [],
        orders: [],
        customers: [],
        inventory: [],
        categories: [],
        cache: {},
        cacheExpiry: {},
        realTimeMetrics: {},
        lastUpdate: null
      });
    }
  }))
);

export default useDataStore;
