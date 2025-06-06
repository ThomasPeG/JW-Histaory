import { AuthService } from './../auth/services/auth.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Visit } from '../models/formularios.model';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class AmoService {
  private apiUrl = `${environment.apiUrl}/api/amo`;
  private userId: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private networkService: NetworkService,
    private storageService: StorageService,
    private syncService: SyncService
  ) {
    // Inicializar userId de forma asíncrona
    this.initUserId();
  }

  // Método para inicializar el userId
  private async initUserId(): Promise<void> {
    this.userId = await this.authService.getUserId();
  }

  // Obtener todos los amos
  getAmosByUserId(): Observable<any[]> {
    // Si userId no está disponible, intentar obtenerlo primero
    if (!this.userId) {
      return from(this.authService.getUserId()).pipe(
        switchMap(userId => {
          if (!userId) {
            return throwError(() => new Error('Usuario no autenticado'));
          }
          this.userId = userId;
          return this.getAmosWithUserId();
        })
      );
    }
    
    return this.getAmosWithUserId();
  }

  // Método auxiliar para obtener amos con userId ya disponible
  private getAmosWithUserId(): Observable<any[]> {
    // Si hay conexión, obtener datos del servidor y guardarlos localmente
    if (this.networkService.isOnline()) {
      return this.http.get<any[]>(`${this.apiUrl}/all/${this.userId}`).pipe(
        tap(amos => {
          // Guardar en IndexedDB para acceso offline
          this.storageService.saveAmos(this.userId!, amos);
        }),
        catchError(error => {
          console.error('Error al obtener amos del servidor:', error);
          // En caso de error, intentar obtener datos locales
          return from(this.storageService.getAmos(this.userId!));
        })
      );
    } else {
      // Sin conexión, obtener datos locales
      return from(this.storageService.getAmos(this.userId!)).pipe(
        catchError(error => {
          console.error('Error al obtener amos locales:', error);
          return of([]);
        })
      );
    }
  }

  // Obtener un amo por ID
  getAmoById(id: string): Observable<any> {
    // Si hay conexión, obtener datos del servidor
    if (this.networkService.isOnline()) {
      return this.http.get<any>(`${this.apiUrl}/one/${id}`).pipe(
        tap(amo => {
          // Guardar en IndexedDB para acceso offline
          this.storageService.saveAmo(amo);
        }),
        catchError(error => {
          console.error('Error al obtener amo del servidor:', error);
          // En caso de error, intentar obtener datos locales
          return from(this.storageService.getAmo(id));
        })
      );
    } else {
      // Sin conexión, obtener datos locales
      return from(this.storageService.getAmo(id)).pipe(
        catchError(error => {
          console.error('Error al obtener amo local:', error);
          return throwError(() => new Error('No se pudo obtener la información del amo'));
        })
      );
    }
  }

  // Crear un nuevo amo
  createAmoByUserId(amoData: any): Observable<any> {
    if (!this.userId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    // Generar un ID temporal para el modo offline
    const tempId = `temp_${Date.now()}`;
    const newAmo = {
      ...amoData,
      _id: tempId,
      userId: this.userId,
      createdOffline: true
    };

    // Si hay conexión, enviar al servidor
    if (this.networkService.isOnline()) {
      return this.http.post<any>(`${this.apiUrl}/${this.userId}`, amoData).pipe(
        tap(response => {
          // Guardar la respuesta del servidor en IndexedDB
          this.storageService.saveAmo(response);
        }),
        catchError(error => {
          console.error('Error al crear amo en el servidor:', error);
          // Guardar localmente y agregar a la cola de sincronización
          this.storageService.saveAmo(newAmo);
          this.syncService.addToPendingRequests({
            type: 'POST',
            url: `${this.apiUrl}/${this.userId}`,
            data: amoData
          });
          return of(newAmo);
        })
      );
    } else {
      // Sin conexión, guardar localmente y agregar a la cola de sincronización
      this.storageService.saveAmo(newAmo);
      this.syncService.addToPendingRequests({
        type: 'POST',
        url: `${this.apiUrl}/${this.userId}`,
        data: amoData
      });
      return of(newAmo);
    }
  }

  // Crear una visita para un amo
  createVisitAmoById(amoData: {amoId: string, visit: Visit}): Observable<any> {
    // Si hay conexión, enviar al servidor
    if (this.networkService.isOnline()) {
      return this.http.post<any>(`${this.apiUrl}/revisit/${amoData.amoId}`, amoData.visit).pipe(
        tap(response => {
          // Actualizar el amo en IndexedDB
          this.storageService.saveAmo(response);
        }),
        catchError(error => {
          console.error('Error al crear visita en el servidor:', error);
          // Actualizar localmente y agregar a la cola de sincronización
          return this.handleOfflineVisitCreation(amoData);
        })
      );
    } else {
      // Sin conexión, actualizar localmente y agregar a la cola de sincronización
      return this.handleOfflineVisitCreation(amoData);
    }
  }

  private handleOfflineVisitCreation(amoData: {amoId: string, visit: Visit}): Observable<any> {
    return from(this.storageService.getAmo(amoData.amoId)).pipe(
      switchMap(amo => {
        if (!amo) {
          return throwError(() => new Error('No se encontró el amo'));
        }

        // Agregar la nueva visita al amo (al final del array)
        if (!amo.visit) {
          amo.visit = [];
        }
        amo.visit.push(amoData.visit); // Cambiado de unshift a push
        
        // Guardar el amo actualizado
        return from(this.storageService.saveAmo(amo)).pipe(
          tap(() => {
            // Agregar a la cola de sincronización
            this.syncService.addToPendingRequests({
              type: 'POST',
              url: `${this.apiUrl}/revisit/${amoData.amoId}`,
              data: amoData.visit
            });
          }),
          map(() => amo)
        );
      })
    );
  }

  // Actualizar un amo existente
  updateAmoById(id: string, amoData: any): Observable<any> {
    // Si hay conexión, enviar al servidor
    if (this.networkService.isOnline()) {
      return this.http.put<any>(`${this.apiUrl}/${id}`, amoData).pipe(
        tap(response => {
          // Actualizar en IndexedDB
          this.storageService.saveAmo(response);
        }),
        catchError(error => {
          console.error('Error al actualizar amo en el servidor:', error);
          // Actualizar localmente y agregar a la cola de sincronización
          const updatedAmo = { ...amoData, _id: id };
          this.storageService.saveAmo(updatedAmo);
          this.syncService.addToPendingRequests({
            type: 'PUT',
            url: `${this.apiUrl}/${id}`,
            data: amoData
          });
          return of(updatedAmo);
        })
      );
    } else {
      // Sin conexión, actualizar localmente y agregar a la cola de sincronización
      const updatedAmo = { ...amoData, _id: id };
      this.storageService.saveAmo(updatedAmo);
      this.syncService.addToPendingRequests({
        type: 'PUT',
        url: `${this.apiUrl}/${id}`,
        data: amoData
      });
      return of(updatedAmo);
    }
  }

  // Eliminar un amo
  deleteAmoById(id: string): Observable<any> {
    // Si hay conexión, enviar al servidor
    if (this.networkService.isOnline()) {
      return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
        tap(() => {
          // Eliminar de IndexedDB
          // Nota: Aquí necesitaríamos un método para eliminar un amo en StorageService
        }),
        catchError(error => {
          console.error('Error al eliminar amo en el servidor:', error);
          // Agregar a la cola de sincronización
          this.syncService.addToPendingRequests({
            type: 'DELETE',
            url: `${this.apiUrl}/${id}`,
            data: null
          });
          return of({ success: true });
        })
      );
    } else {
      // Sin conexión, marcar para eliminación y agregar a la cola de sincronización
      this.syncService.addToPendingRequests({
        type: 'DELETE',
        url: `${this.apiUrl}/${id}`,
        data: null
      });
      return of({ success: true });
    }
  }
}