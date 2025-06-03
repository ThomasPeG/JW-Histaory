import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { Amo, Visit } from '../models/formularios.model';

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

  private async loadPendingRequests() {
    const requests = await this.storageService.get('pendingRequests');
    if (requests) {
      this.pendingRequests = JSON.parse(requests);
    }
  }

  private async savePendingRequests() {
    await this.storageService.set('pendingRequests', JSON.stringify(this.pendingRequests));
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