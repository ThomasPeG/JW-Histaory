import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    // Escuchar eventos de conexión/desconexión
    fromEvent(window, 'online').subscribe(() => this.online$.next(true));
    fromEvent(window, 'offline').subscribe(() => this.online$.next(false));
  }

  // Verificar si hay conexión a internet
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Observable para cambios en el estado de la red
  onNetworkChange(): Observable<boolean> {
    return this.online$.asObservable();
  }
}