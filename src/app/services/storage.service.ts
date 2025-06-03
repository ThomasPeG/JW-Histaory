import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;
  private DB_NAME = 'jw_history_db';
  private DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.storage = window.localStorage;
    this.initIndexedDB();
  }

  // Métodos para localStorage (datos pequeños como configuración y tokens)
  async set(key: string, value: string): Promise<void> {
    this.storage.setItem(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  async remove(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  // Métodos para IndexedDB (datos más grandes como amos y visitas)
  private initIndexedDB(): void {
    const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

    request.onerror = (event) => {
      console.error('Error al abrir la base de datos:', event);
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Crear almacenes de objetos
      if (!db.objectStoreNames.contains('amos')) {
        const amosStore = db.createObjectStore('amos', { keyPath: '_id' });
        amosStore.createIndex('userId', 'userId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('pendingRequests')) {
        db.createObjectStore('pendingRequests', { keyPath: 'id' });
      }
    };
  }

  // Guardar amos en IndexedDB
  async saveAmos(userId: string, amos: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction(['amos'], 'readwrite');
      const store = transaction.objectStore('amos');

      // Primero eliminamos los amos existentes del usuario
      const index = store.index('userId');
      const request = index.openCursor(IDBKeyRange.only(userId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          // Una vez eliminados, agregamos los nuevos
          amos.forEach(amo => {
            store.add(amo);
          });
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = (event) => reject(event);
    });
  }

  // Obtener amos de IndexedDB
  async getAmos(userId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction(['amos'], 'readonly');
      const store = transaction.objectStore('amos');
      const index = store.index('userId');
      const request = index.getAll(IDBKeyRange.only(userId));

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  // Obtener un amo específico
  async getAmo(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction(['amos'], 'readonly');
      const store = transaction.objectStore('amos');
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  }

  // Guardar un amo específico
  async saveAmo(amo: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Base de datos no inicializada'));
        return;
      }

      const transaction = this.db.transaction(['amos'], 'readwrite');
      const store = transaction.objectStore('amos');
      const request = store.put(amo);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject(event);
    });
  }
}