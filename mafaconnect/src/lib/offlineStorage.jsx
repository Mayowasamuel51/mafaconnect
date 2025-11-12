// src/lib/offlineStorage.js

const DB_NAME = "MAFAConnectDB";
const DB_VERSION = 1;

class OfflineStorage {
  constructor() {
    this.db = null;
  }

  // Initialize IndexedDB connection
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("pendingSales")) {
          db.createObjectStore("pendingSales", { keyPath: "id" });
        }
      };
    });
  }

  // Add a pending sale
  async addPendingSale(sale) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction(["pendingSales"], "readwrite");
    const store = transaction.objectStore("pendingSales");

    const pendingSale = {
      id: crypto.randomUUID(),
      data: sale,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const request = store.add(pendingSale);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get all pending sales
  async getPendingSales() {
    if (!this.db) await this.init();

    const transaction = this.db.transaction(["pendingSales"], "readonly");
    const store = transaction.objectStore("pendingSales");

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Remove a sale by ID
  async removePendingSale(id) {
    if (!this.db) await this.init();

    const transaction = this.db.transaction(["pendingSales"], "readwrite");
    const store = transaction.objectStore("pendingSales");

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();

// const DB_NAME = 'MAFAConnectDB';
// const DB_VERSION = 1;

// interface PendingSale {
//   id: string;
//   data: any;
//   timestamp: number;
// }

// class OfflineStorage {
//   private db: IDBDatabase | null = null;

//   async init() {
//     return new Promise<void>((resolve, reject) => {
//       const request = indexedDB.open(DB_NAME, DB_VERSION);

//       request.onerror = () => reject(request.error);
//       request.onsuccess = () => {
//         this.db = request.result;
//         resolve();
//       };

//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         if (!db.objectStoreNames.contains('pendingSales')) {
//           db.createObjectStore('pendingSales', { keyPath: 'id' });
//         }
//       };
//     });
//   }

//   async addPendingSale(sale: any) {
//     if (!this.db) await this.init();
    
//     const transaction = this.db!.transaction(['pendingSales'], 'readwrite');
//     const store = transaction.objectStore('pendingSales');
    
//     const pendingSale: PendingSale = {
//       id: crypto.randomUUID(),
//       data: sale,
//       timestamp: Date.now()
//     };

//     return new Promise<void>((resolve, reject) => {
//       const request = store.add(pendingSale);
//       request.onsuccess = () => resolve();
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async getPendingSales(): Promise<PendingSale[]> {
//     if (!this.db) await this.init();
    
//     const transaction = this.db!.transaction(['pendingSales'], 'readonly');
//     const store = transaction.objectStore('pendingSales');

//     return new Promise((resolve, reject) => {
//       const request = store.getAll();
//       request.onsuccess = () => resolve(request.result);
//       request.onerror = () => reject(request.error);
//     });
//   }

//   async removePendingSale(id: string) {
//     if (!this.db) await this.init();
    
//     const transaction = this.db!.transaction(['pendingSales'], 'readwrite');
//     const store = transaction.objectStore('pendingSales');

//     return new Promise<void>((resolve, reject) => {
//       const request = store.delete(id);
//       request.onsuccess = () => resolve();
//       request.onerror = () => reject(request.error);
//     });
//   }
// }

// export const offlineStorage = new OfflineStorage();
