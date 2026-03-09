// Offline queue for user actions using IndexedDB
const DB_NAME = 'bebrivus-offline';
const STORE_NAME = 'queue';
const DB_VERSION = 1;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const offlineQueue = {
  add: async (action: { url: string; options: RequestInit }) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.add({
        ...action,
        timestamp: Date.now(),
        synced: false
      });
    } catch (error) {
      console.error('Failed to add to offline queue:', error);
    }
  },

  sync: async () => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = async () => {
        const pending = request.result;
        for (const action of pending) {
          try {
            await fetch(action.url, action.options);
            // Delete from queue after successful sync
            const deleteTx = db.transaction(STORE_NAME, 'readwrite');
            const deleteStore = deleteTx.objectStore(STORE_NAME);
            await deleteStore.delete(action.id);
            console.log('Synced offline action:', action.url);
          } catch (e) {
            console.log('Still offline, keeping in queue');
          }
        }
      };
    } catch (error) {
      console.error('Failed to sync offline queue:', error);
    }
  }
};

// Auto sync when back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online, syncing queued actions...');
    offlineQueue.sync();
  });
}
