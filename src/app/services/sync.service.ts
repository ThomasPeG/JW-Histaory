import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private pendingRequests: any[] = [];
  private syncInProgress = false;

  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private storageService: StorageService
  ) {
    // Cargar solicitudes pendientes del almacenamiento local al iniciar
    this.loadPendingRequests();
    
    // Configurar sincronización cuando se recupere la conexión
    this.networkService.onNetworkChange().subscribe(isConnected => {
      if (isConnected) {
        this.syncPendingRequests();
      }
    });
  }

  // En el método loadPendingRequests
  private async loadPendingRequests() {
    try {
      // Usar IndexedDB en lugar de localStorage
      const pendingRequestsFromDB = await this.storageService.getPendingRequests();
      if (pendingRequestsFromDB && pendingRequestsFromDB.length > 0) {
        this.pendingRequests = pendingRequestsFromDB;
      } else {
        // Compatibilidad con versiones anteriores - cargar desde localStorage
        const requests = await this.storageService.get('pendingRequests');
        if (requests) {
          this.pendingRequests = JSON.parse(requests);
          // Migrar a IndexedDB
          await this.savePendingRequests();
          // Eliminar de localStorage
          await this.storageService.remove('pendingRequests');
        }
      }
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
      this.pendingRequests = [];
    }
  }

  private async savePendingRequests() {
    try {
      await this.storageService.savePendingRequests(this.pendingRequests);
    } catch (error) {
      console.error('Error al guardar solicitudes pendientes:', error);
      // Fallback a localStorage
      await this.storageService.set('pendingRequests', JSON.stringify(this.pendingRequests));
    }
  }

  // Método para agregar una solicitud a la cola
  addToPendingRequests(request: any) {
    this.pendingRequests.push({
      ...request,
      timestamp: new Date().getTime(),
      id: this.generateUniqueId()
    });
    this.savePendingRequests();
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Sincronizar solicitudes pendientes cuando hay conexión
  async syncPendingRequests() {
    if (this.syncInProgress || this.pendingRequests.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Procesar cada solicitud pendiente en orden
      for (let i = 0; i < this.pendingRequests.length; i++) {
        const request = this.pendingRequests[i];
        try {
          await this.processRequest(request);
          // Eliminar la solicitud procesada
          this.pendingRequests.splice(i, 1);
          i--; // Ajustar el índice
          await this.savePendingRequests();
        } catch (error) {
          console.error('Error al procesar solicitud pendiente:', error);
          // Si hay un error, continuamos con la siguiente solicitud
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  private async processRequest(request: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let observable: Observable<any>;

      switch (request.type) {
        case 'POST':
          observable = this.http.post(request.url, request.data);
          break;
        case 'PUT':
          observable = this.http.put(request.url, request.data);
          break;
        case 'DELETE':
          observable = this.http.delete(request.url);
          break;
        default:
          reject(new Error('Tipo de solicitud no soportado'));
          return;
      }

      observable.subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error)
      });
    });
  }
}