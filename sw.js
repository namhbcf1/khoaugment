/**
 * Advanced Service Worker for Kho Augment POS System
 * Provides offline support, background sync, and push notifications
 */

const CACHE_NAME = 'kho-augment-v1.0.0';
const STATIC_CACHE = 'kho-augment-static-v1.0.0';
const DYNAMIC_CACHE = 'kho-augment-dynamic-v1.0.0';
const API_CACHE = 'kho-augment-api-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/products',
  '/api/customers',
  '/api/inventory/status',
  '/api/auth/profile'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE).then(cache => {
        console.log('Service Worker: Pre-caching API endpoints');
        return Promise.allSettled(
          API_ENDPOINTS.map(endpoint =>
            fetch(endpoint)
              .then(response => response.ok ? cache.put(endpoint, response) : null)
              .catch(() => null)
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html') || caches.match('/');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered:', event.tag);

  if (event.tag === 'pos-transaction') {
    event.waitUntil(syncPOSTransactions());
  } else if (event.tag === 'inventory-update') {
    event.waitUntil(syncInventoryUpdates());
  }
});

// Sync POS transactions when back online
async function syncPOSTransactions() {
  try {
    const db = await openIndexedDB();
    const transactions = await getOfflineTransactions(db);

    for (const transaction of transactions) {
      try {
        const response = await fetch('/api/pos/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction.data)
        });

        if (response.ok) {
          await removeOfflineTransaction(db, transaction.id);
          console.log('Service Worker: Synced transaction:', transaction.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync transaction:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
  }
}

// Sync inventory updates
async function syncInventoryUpdates() {
  try {
    const db = await openIndexedDB();
    const updates = await getOfflineInventoryUpdates(db);

    for (const update of updates) {
      try {
        const response = await fetch('/api/inventory/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        });

        if (response.ok) {
          await removeOfflineInventoryUpdate(db, update.id);
          console.log('Service Worker: Synced inventory update:', update.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync inventory update:', error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Inventory sync failed:', error);
  }
}

// IndexedDB helper functions
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KhoAugmentDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('inventory')) {
        db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getOfflineTransactions(db) {
  const transaction = db.transaction(['transactions'], 'readonly');
  const store = transaction.objectStore('transactions');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeOfflineTransaction(db, id) {
  const transaction = db.transaction(['transactions'], 'readwrite');
  const store = transaction.objectStore('transactions');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getOfflineInventoryUpdates(db) {
  const transaction = db.transaction(['inventory'], 'readonly');
  const store = transaction.objectStore('inventory');
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeOfflineInventoryUpdate(db, id) {
  const transaction = db.transaction(['inventory'], 'readwrite');
  const store = transaction.objectStore('inventory');
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

console.log('[SW] Advanced Service Worker loaded with offline support');