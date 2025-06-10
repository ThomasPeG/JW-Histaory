import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private storage: Storage;
  private DB_NAME = 'jw_history_db';
  private DB_VERSION = 1;
  private db: IDBDatabase | null = null;
  private dbInitialized = false;
  private dbInitPromise: Promise<void> | null = null;

  constructor(private platform: Platform) {
    this.storage = window.localStorage;
    this.dbInitPromise = this.initIndexedDB().then(() => {
      console.log('IndexedDB inicializada correctamente');
    }).catch(error => {
      console.error('Error al inicializar IndexedDB:', error);
    });
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
  private async initIndexedDB(): Promise<void> {
    // Primero intentamos hacer el almacenamiento persistente en Android
    if (this.platform.is('android') && navigator.storage && navigator.storage.persist) {
      try {
        const isPersisted = await navigator.storage.persist();
        console.log(`Almacenamiento persistente ${isPersisted ? 'concedido' : 'denegado'}`);
      } catch (error) {
        console.warn('No se pudo solicitar almacenamiento persistente:', error);
      }
    }

    return new Promise((resolve, reject) => {
      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      } catch (error) {
        console.error('Error al intentar abrir IndexedDB:', error);
        reject(error);
        return;
      }

      request.onerror = (event) => {
        console.error('Error al abrir la base de datos:', event);
        this.dbInitialized = false;
        reject(new Error('No se pudo abrir la base de datos IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.dbInitialized = true;
        
        // Configurar manejo de errores para conexiones perdidas
        this.db.onerror = (event) => {
          console.error('Error de IndexedDB:', event);
        };
        
        resolve();
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

      // Manejar bloqueo de la base de datos (común en iOS)
      request.onblocked = () => {
        console.warn('La base de datos está bloqueada. Cerrando conexiones antiguas...');
        if (this.db) {
          this.db.close();
          this.db = null;
          this.dbInitialized = false;
        }
        reject(new Error('Base de datos bloqueada'));
      };
    });
  }

  // Asegurar que la base de datos esté inicializada antes de usarla
  private async ensureDbInitialized(): Promise<void> {
    if (this.dbInitialized && this.db) {
      return Promise.resolve();
    }
    
    if (this.dbInitPromise) {
      return this.dbInitPromise;
    }
    
    this.dbInitPromise = this.initIndexedDB();
    return this.dbInitPromise;
  }

  // Guardar amos en IndexedDB
  async saveAmos(userId: string, amos: any[]): Promise<void> {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['amos'], 'readwrite');
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
    } catch (error) {
      console.error('Error al guardar amos:', error);
      throw error;
    }
  }

  // Obtener amos de IndexedDB
  async getAmos(userId: string): Promise<any[]> {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['amos'], 'readonly');
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
    } catch (error) {
      console.error('Error al obtener amos:', error);
      return [];
    }
  }

  // Obtener un amo específico
  async getAmo(id: string): Promise<any> {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['amos'], 'readonly');
        const store = transaction.objectStore('amos');
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (event) => {
          reject(event);
        };
      });
    } catch (error) {
      console.error('Error al obtener amo:', error);
      throw error;
    }
  }

  // Guardar un amo específico
  async saveAmo(amo: any): Promise<void> {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }

      // Asegurarse de que el objeto tenga un _id
      if (!amo._id) {
        amo._id = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['amos'], 'readwrite');
        const store = transaction.objectStore('amos');
        const request = store.put(amo);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error('Error en la operación put:', event);
          reject(event);
        };
      });
    } catch (error) {
      console.error('Error al guardar amo:', error);
      throw error;
    }
  }

  // Añadir estos métodos a la clase StorageService
  
  // Guardar solicitudes pendientes
  async savePendingRequests(requests: any[]): Promise<void> {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }
  
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['pendingRequests'], 'readwrite');
        const store = transaction.objectStore('pendingRequests');
        
        // Limpiar el almacén primero
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          // Luego agregar todas las solicitudes
          requests.forEach(request => {
            store.add(request);
          });
        };
  
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(event);
      });
    } catch (error) {
      console.error('Error al guardar solicitudes pendientes:', error);
      throw error;
    }
  }
  
  // Obtener solicitudes pendientes
  async getPendingRequests(): Promise<any[]> {
    try {
      await this.ensureDbInitialized();
      
      if (!this.db) {
        throw new Error('Base de datos no inicializada');
      }
  
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['pendingRequests'], 'readonly');
        const store = transaction.objectStore('pendingRequests');
        const request = store.getAll();
  
        request.onsuccess = () => {
          resolve(request.result || []);
        };
  
        request.onerror = (event) => {
          reject(event);
        };
      });
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
      return [];
    }
  }
}
