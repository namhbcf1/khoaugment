/**
 * Offline Data Manager
 * Handles offline data storage and synchronization
 */

class OfflineManager {
  constructor() {
    this.dbName = 'KhoAugmentDB';
    this.dbVersion = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    
    this.init();
    this.setupEventListeners();
  }

  async init() {
    try {
      this.db = await this.openDatabase();
      console.log('OfflineManager: Database initialized');
      
      // Register service worker for background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        console.log('OfflineManager: Service Worker ready for background sync');
      }
    } catch (error) {
      console.error('OfflineManager: Initialization failed:', error);
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          transactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          transactionStore.createIndex('status', 'status', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { 
            keyPath: 'id' 
          });
          productStore.createIndex('sku', 'sku', { unique: true });
          productStore.createIndex('category', 'category', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { 
            keyPath: 'id' 
          });
          customerStore.createIndex('phone', 'phone', { unique: false });
          customerStore.createIndex('email', 'email', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('inventory')) {
          const inventoryStore = db.createObjectStore('inventory', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          inventoryStore.createIndex('productId', 'productId', { unique: false });
          inventoryStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('OfflineManager: Back online, starting sync');
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('OfflineManager: Gone offline');
    });
  }

  // Transaction Management
  async saveTransaction(transactionData) {
    try {
      const transaction = this.db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      
      const offlineTransaction = {
        ...transactionData,
        timestamp: new Date().toISOString(),
        status: 'pending',
        offline: true
      };
      
      const result = await this.promisifyRequest(store.add(offlineTransaction));
      console.log('OfflineManager: Transaction saved offline:', result);
      
      // Schedule background sync
      this.scheduleBackgroundSync('pos-transaction');
      
      return result;
    } catch (error) {
      console.error('OfflineManager: Failed to save transaction:', error);
      throw error;
    }
  }

  async getOfflineTransactions() {
    try {
      const transaction = this.db.transaction(['transactions'], 'readonly');
      const store = transaction.objectStore('transactions');
      const index = store.index('status');
      
      return await this.promisifyRequest(index.getAll('pending'));
    } catch (error) {
      console.error('OfflineManager: Failed to get offline transactions:', error);
      return [];
    }
  }

  async markTransactionSynced(transactionId) {
    try {
      const transaction = this.db.transaction(['transactions'], 'readwrite');
      const store = transaction.objectStore('transactions');
      
      const record = await this.promisifyRequest(store.get(transactionId));
      if (record) {
        record.status = 'synced';
        record.syncedAt = new Date().toISOString();
        await this.promisifyRequest(store.put(record));
      }
    } catch (error) {
      console.error('OfflineManager: Failed to mark transaction as synced:', error);
    }
  }

  // Product Management
  async cacheProducts(products) {
    try {
      const transaction = this.db.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      
      for (const product of products) {
        await this.promisifyRequest(store.put({
          ...product,
          cachedAt: new Date().toISOString()
        }));
      }
      
      console.log(`OfflineManager: Cached ${products.length} products`);
    } catch (error) {
      console.error('OfflineManager: Failed to cache products:', error);
    }
  }

  async getCachedProducts() {
    try {
      const transaction = this.db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      
      return await this.promisifyRequest(store.getAll());
    } catch (error) {
      console.error('OfflineManager: Failed to get cached products:', error);
      return [];
    }
  }

  async searchCachedProducts(query) {
    try {
      const products = await this.getCachedProducts();
      const searchTerm = query.toLowerCase();
      
      return products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.sku.toLowerCase().includes(searchTerm) ||
        (product.barcode && product.barcode.includes(searchTerm))
      );
    } catch (error) {
      console.error('OfflineManager: Failed to search cached products:', error);
      return [];
    }
  }

  // Customer Management
  async cacheCustomers(customers) {
    try {
      const transaction = this.db.transaction(['customers'], 'readwrite');
      const store = transaction.objectStore('customers');
      
      for (const customer of customers) {
        await this.promisifyRequest(store.put({
          ...customer,
          cachedAt: new Date().toISOString()
        }));
      }
      
      console.log(`OfflineManager: Cached ${customers.length} customers`);
    } catch (error) {
      console.error('OfflineManager: Failed to cache customers:', error);
    }
  }

  async getCachedCustomers() {
    try {
      const transaction = this.db.transaction(['customers'], 'readonly');
      const store = transaction.objectStore('customers');
      
      return await this.promisifyRequest(store.getAll());
    } catch (error) {
      console.error('OfflineManager: Failed to get cached customers:', error);
      return [];
    }
  }

  async findCustomerByPhone(phone) {
    try {
      const transaction = this.db.transaction(['customers'], 'readonly');
      const store = transaction.objectStore('customers');
      const index = store.index('phone');
      
      return await this.promisifyRequest(index.get(phone));
    } catch (error) {
      console.error('OfflineManager: Failed to find customer by phone:', error);
      return null;
    }
  }

  // Inventory Management
  async saveInventoryUpdate(updateData) {
    try {
      const transaction = this.db.transaction(['inventory'], 'readwrite');
      const store = transaction.objectStore('inventory');
      
      const inventoryUpdate = {
        ...updateData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      const result = await this.promisifyRequest(store.add(inventoryUpdate));
      console.log('OfflineManager: Inventory update saved offline:', result);
      
      // Schedule background sync
      this.scheduleBackgroundSync('inventory-update');
      
      return result;
    } catch (error) {
      console.error('OfflineManager: Failed to save inventory update:', error);
      throw error;
    }
  }

  // Sync Management
  async syncOfflineData() {
    if (!this.isOnline) {
      console.log('OfflineManager: Cannot sync - still offline');
      return;
    }

    try {
      await this.syncTransactions();
      await this.syncInventoryUpdates();
      console.log('OfflineManager: Sync completed successfully');
    } catch (error) {
      console.error('OfflineManager: Sync failed:', error);
    }
  }

  async syncTransactions() {
    const transactions = await this.getOfflineTransactions();
    
    for (const transaction of transactions) {
      try {
        const response = await fetch('/api/pos/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          await this.markTransactionSynced(transaction.id);
          console.log('OfflineManager: Transaction synced:', transaction.id);
        }
      } catch (error) {
        console.error('OfflineManager: Failed to sync transaction:', error);
      }
    }
  }

  async syncInventoryUpdates() {
    try {
      const transaction = this.db.transaction(['inventory'], 'readonly');
      const store = transaction.objectStore('inventory');
      const index = store.index('status');
      const updates = await this.promisifyRequest(index.getAll('pending'));
      
      for (const update of updates) {
        try {
          const response = await fetch('/api/inventory/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(update)
          });
          
          if (response.ok) {
            // Mark as synced
            const writeTransaction = this.db.transaction(['inventory'], 'readwrite');
            const writeStore = writeTransaction.objectStore('inventory');
            update.status = 'synced';
            update.syncedAt = new Date().toISOString();
            await this.promisifyRequest(writeStore.put(update));
            
            console.log('OfflineManager: Inventory update synced:', update.id);
          }
        } catch (error) {
          console.error('OfflineManager: Failed to sync inventory update:', error);
        }
      }
    } catch (error) {
      console.error('OfflineManager: Failed to sync inventory updates:', error);
    }
  }

  async scheduleBackgroundSync(tag) {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log(`OfflineManager: Background sync scheduled for ${tag}`);
      } catch (error) {
        console.error('OfflineManager: Failed to schedule background sync:', error);
      }
    }
  }

  // Utility Methods
  promisifyRequest(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  isOffline() {
    return !this.isOnline;
  }

  async clearOfflineData() {
    try {
      const transaction = this.db.transaction(['transactions', 'inventory'], 'readwrite');
      await Promise.all([
        this.promisifyRequest(transaction.objectStore('transactions').clear()),
        this.promisifyRequest(transaction.objectStore('inventory').clear())
      ]);
      console.log('OfflineManager: Offline data cleared');
    } catch (error) {
      console.error('OfflineManager: Failed to clear offline data:', error);
    }
  }

  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage,
          available: estimate.quota,
          percentage: Math.round((estimate.usage / estimate.quota) * 100)
        };
      } catch (error) {
        console.error('OfflineManager: Failed to get storage usage:', error);
      }
    }
    return null;
  }
}

export default new OfflineManager();
