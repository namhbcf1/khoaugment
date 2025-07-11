/**
 * Cache Utilities
 * Provides in-memory and persistent caching capabilities
 * Optimized for offline-first operation
 */

// In-memory cache store with TTL support
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    
    // Run cleanup every minute to remove expired items
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }
  
  /**
   * Set a value in the cache
   * @param {String} key - Cache key
   * @param {*} value - Value to cache
   * @param {Number} ttl - Time to live in seconds (0 = no expiry)
   */
  set(key, value, ttl = 0) {
    this.cache.set(key, value);
    
    if (ttl > 0) {
      const expiryTime = Date.now() + (ttl * 1000);
      this.ttls.set(key, expiryTime);
    } else {
      this.ttls.delete(key); // No expiration
    }
  }
  
  /**
   * Get a value from the cache
   * @param {String} key - Cache key
   * @returns {*} - Cached value or undefined if not found or expired
   */
  get(key) {
    // Check if expired
    if (this.isExpired(key)) {
      this.delete(key);
      return undefined;
    }
    
    return this.cache.get(key);
  }
  
  /**
   * Delete a value from the cache
   * @param {String} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }
  
  /**
   * Check if a key exists in the cache
   * @param {String} key - Cache key
   * @returns {Boolean} - True if key exists and is not expired
   */
  has(key) {
    if (!this.cache.has(key)) return false;
    
    // Check if expired
    if (this.isExpired(key)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if a key is expired
   * @param {String} key - Cache key
   * @returns {Boolean} - True if key is expired
   */
  isExpired(key) {
    const expiry = this.ttls.get(key);
    if (!expiry) return false; // No expiration set
    
    return Date.now() > expiry;
  }
  
  /**
   * Remove all expired items from the cache
   */
  cleanup() {
    for (const [key, expiry] of this.ttls.entries()) {
      if (Date.now() > expiry) {
        this.delete(key);
      }
    }
  }
  
  /**
   * Get all keys in the cache
   * @returns {Array} - Array of cache keys
   */
  keys() {
    // Filter out expired keys
    return Array.from(this.cache.keys()).filter(key => !this.isExpired(key));
  }
  
  /**
   * Destroy the cache and clear cleanup interval
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Create in-memory cache instance
const localCache = new MemoryCache();

// IndexedDB cache for persistent storage
class IndexedDBCache {
  constructor(dbName = 'posAppCache', storeName = 'cache', version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.db = null;
    this.isInitialized = false;
    
    // Initialize the database connection
    this.init();
  }
  
  /**
   * Initialize IndexedDB connection
   * @returns {Promise<void>}
   */
  async init() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported');
      return;
    }
    
    try {
      const request = indexedDB.open(this.dbName, this.version);
      
      // Create object store if needed
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
        }
      };
      
      // Handle success
      this.db = await new Promise((resolve, reject) => {
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        
        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject(event.target.error);
        };
      });
      
      this.isInitialized = true;
      
      // Start cleanup task
      this.scheduleCleanup();
    } catch (error) {
      console.error('Failed to initialize IndexedDB cache:', error);
    }
  }
  
  /**
   * Ensure database is initialized
   * @returns {Promise<IDBDatabase>} - IndexedDB database
   */
  async ensureInitialized() {
    if (this.isInitialized) return this.db;
    
    // If not initialized, wait for it to complete
    await new Promise(resolve => {
      const checkInitialized = () => {
        if (this.isInitialized) {
          resolve();
        } else {
          setTimeout(checkInitialized, 100);
        }
      };
      
      checkInitialized();
    });
    
    return this.db;
  }
  
  /**
   * Set a value in the cache
   * @param {String} key - Cache key
   * @param {*} value - Value to cache (must be serializable)
   * @param {Number} ttl - Time to live in seconds (0 = no expiry)
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = 0) {
    try {
      const db = await this.ensureInitialized();
      if (!db) return;
      
      const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : 0;
      
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put({
          key,
          value,
          expiry,
          created: Date.now()
        });
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
        
        // Commit transaction
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Failed to set item in IndexedDB cache:', error);
    }
  }
  
  /**
   * Get a value from the cache
   * @param {String} key - Cache key
   * @returns {Promise<*>} - Cached value or undefined if not found or expired
   */
  async get(key) {
    try {
      const db = await this.ensureInitialized();
      if (!db) return undefined;
      
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(key);
        
        request.onsuccess = (event) => {
          const data = event.target.result;
          if (!data) {
            resolve(undefined);
            return;
          }
          
          // Check if expired
          if (data.expiry > 0 && Date.now() > data.expiry) {
            // Delete expired item
            this.delete(key).catch(console.error);
            resolve(undefined);
          } else {
            resolve(data.value);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error getting cached item:', event.target.error);
          reject(event.target.error);
        };
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get item from IndexedDB cache:', error);
      return undefined;
    }
  }
  
  /**
   * Delete a value from the cache
   * @param {String} key - Cache key
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      const db = await this.ensureInitialized();
      if (!db) return;
      
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Failed to delete item from IndexedDB cache:', error);
    }
  }
  
  /**
   * Clear all items from the cache
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const db = await this.ensureInitialized();
      if (!db) return;
      
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Failed to clear IndexedDB cache:', error);
    }
  }
  
  /**
   * Check if a key exists in the cache
   * @param {String} key - Cache key
   * @returns {Promise<Boolean>} - True if key exists and is not expired
   */
  async has(key) {
    try {
      const value = await this.get(key);
      return value !== undefined;
    } catch (error) {
      console.error('Failed to check key in IndexedDB cache:', error);
      return false;
    }
  }
  
  /**
   * Get all keys in the cache
   * @returns {Promise<Array>} - Array of cache keys
   */
  async keys() {
    try {
      const db = await this.ensureInitialized();
      if (!db) return [];
      
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      return new Promise((resolve, reject) => {
        const request = store.getAllKeys();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
      });
    } catch (error) {
      console.error('Failed to get keys from IndexedDB cache:', error);
      return [];
    }
  }
  
  /**
   * Schedule cleanup of expired items
   */
  scheduleCleanup() {
    // Run cleanup every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }
  
  /**
   * Remove all expired items from the cache
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      const db = await this.ensureInitialized();
      if (!db) return;
      
      const now = Date.now();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expiry');
      
      // Get all items with expiry > 0 and expiry < now
      const range = IDBKeyRange.bound(1, now);
      
      await new Promise((resolve, reject) => {
        const request = index.openCursor(range);
        
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = (event) => reject(event.target.error);
      });
      
      console.log('IndexedDB cache cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup IndexedDB cache:', error);
    }
  }
}

// Create IndexedDB cache instance
const persistentCache = new IndexedDBCache();

// Combined cache with fallback
const combinedCache = {
  /**
   * Set a value in both caches
   * @param {String} key - Cache key
   * @param {*} value - Value to cache
   * @param {Number} ttl - Time to live in seconds
   * @param {Boolean} persistent - Whether to also store in persistent cache
   */
  set: (key, value, ttl = 0, persistent = true) => {
    // Always set in memory cache
    localCache.set(key, value, ttl);
    
    // Optionally set in persistent cache
    if (persistent) {
      persistentCache.set(key, value, ttl).catch(console.error);
    }
  },
  
  /**
   * Get a value from cache, trying memory first then persistent
   * @param {String} key - Cache key
   * @returns {Promise<*>} - Cached value or undefined
   */
  get: async (key) => {
    // Try memory cache first
    const memValue = localCache.get(key);
    if (memValue !== undefined) {
      return memValue;
    }
    
    // Try persistent cache
    const persistentValue = await persistentCache.get(key);
    if (persistentValue !== undefined) {
      // Update memory cache for faster access next time
      localCache.set(key, persistentValue, 0);
    }
    
    return persistentValue;
  },
  
  /**
   * Delete a value from both caches
   * @param {String} key - Cache key
   */
  delete: (key) => {
    localCache.delete(key);
    persistentCache.delete(key).catch(console.error);
  },
  
  /**
   * Clear all items from both caches
   */
  clear: () => {
    localCache.clear();
    persistentCache.clear().catch(console.error);
  },
  
  /**
   * Check if a key exists in either cache
   * @param {String} key - Cache key
   * @returns {Promise<Boolean>} - True if key exists in either cache
   */
  has: async (key) => {
    if (localCache.has(key)) return true;
    return await persistentCache.has(key);
  }
};

export { localCache, persistentCache, combinedCache };
export default localCache; 