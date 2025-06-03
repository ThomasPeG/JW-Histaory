import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NetworkService } from '../services/network.service';

@Injectable()
export class OfflineInterceptor implements HttpInterceptor {

  constructor(private networkService: NetworkService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Si no hay conexión, rechazar inmediatamente las solicitudes que no sean GET
    if (!this.networkService.isOnline() && request.method !== 'GET') {
      return throwError(() => new HttpErrorResponse({
        error: { message: 'Sin conexión a internet' },
        status: 0,
        statusText: 'Offline',
        url: request.url
      }));
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && !this.networkService.isOnline()) {
          // Personalizar el mensaje de error cuando no hay conexión
          return throwError(() => new HttpErrorResponse({
            error: { message: 'Sin conexión a internet' },
            status: 0,
            statusText: 'Offline',
            url: request.url
          }));
        }
        return throwError(() => error);
      })
    );
  }
}