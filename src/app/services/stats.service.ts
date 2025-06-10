import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/services/auth.service';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { MonthlyStats, YearlyStatsSummary } from '../models/stats.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${environment.apiUrl}/api/stats`;
  private userId: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private networkService: NetworkService,
    private storageService: StorageService
  ) {
    // Inicializar userId de forma asíncrona
    this.initUserId();
  }

  // Método para inicializar el userId
  private async initUserId(): Promise<void> {
    this.userId = await this.authService.getUserId();
    console.log('userId inicializado:', this.userId);
  }

  // Obtener estadísticas mensuales
  getMonthlyStats(year: number, month: number): Observable<MonthlyStats> {
    // Si userId no está disponible, intentar obtenerlo primero
    if (!this.userId) {
      return from(this.authService.getUserId()).pipe(
        switchMap(userId => {
          if (!userId) {
            return throwError(() => new Error('Usuario no autenticado'));
          }
          this.userId = userId;
          return this.getMonthlyStatsWithUserId(year, month);
        })
      );
    }
    
    return this.getMonthlyStatsWithUserId(year, month);
  }

  // Método auxiliar para obtener estadísticas con userId ya disponible
  private getMonthlyStatsWithUserId(year: number, month: number): Observable<MonthlyStats> {
    // Si hay conexión, obtener datos del servidor
    if (this.networkService.isOnline()) {
      return this.http.get<MonthlyStats>(`${this.apiUrl}/${this.userId}/${year}/${month}`).pipe(
        tap(stats => {
          // Guardar en localStorage para acceso offline
          this.storageService.set(`stats_${this.userId}_${year}_${month}`, JSON.stringify(stats));
        }),
        catchError(error => {
          console.error('Error al obtener estadísticas mensuales del servidor:', error);
          // En caso de error, intentar obtener datos locales
          return this.getLocalMonthlyStats(year, month);
        })
      );
    } else {
      // Sin conexión, obtener datos locales
      return this.getLocalMonthlyStats(year, month);
    }
  }

  // Obtener estadísticas anuales
  getYearlyStatsSummary(year: number): Observable<YearlyStatsSummary> {
    if (!this.userId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }

    // Si hay conexión, obtener datos del servidor
    if (this.networkService.isOnline()) {
      return this.http.get<YearlyStatsSummary>(`${this.apiUrl}/yearly/${this.userId}/${year}`).pipe(
        tap(stats => {
          // Guardar en localStorage para acceso offline
          this.storageService.set(`yearly_stats_${this.userId}_${year}`, JSON.stringify(stats));
        }),
        catchError(error => {
          console.error('Error al obtener estadísticas anuales del servidor:', error);
          // En caso de error, intentar obtener datos locales
          return this.getLocalYearlyStats(year);
        })
      );
    } else {
      // Sin conexión, obtener datos locales
      return this.getLocalYearlyStats(year);
    }
  }

  // Métodos privados para obtener datos locales
  private getLocalMonthlyStats(year: number, month: number): Observable<MonthlyStats> {
    return from(this.storageService.get(`stats_${this.userId}_${year}_${month}`)).pipe(
      map(stats => {
        if (stats) {
          return JSON.parse(stats);
        }
        throw new Error('No se encontraron estadísticas locales');
      }),
      catchError(error => {
        console.error('Error al obtener estadísticas locales:', error);
        return throwError(() => new Error('No se encontraron estadísticas locales'));
      })
    );
  }

  private getLocalYearlyStats(year: number): Observable<YearlyStatsSummary> {
    return from(this.storageService.get(`yearly_stats_${this.userId}_${year}`)).pipe(
      map(stats => {
        if (stats) {
          return JSON.parse(stats);
        }
        throw new Error('No se encontraron estadísticas anuales locales');
      }),
      catchError(error => {
        console.error('Error al obtener estadísticas anuales locales:', error);
        return throwError(() => new Error('No se encontraron estadísticas anuales locales'));
      })
    );
  }
}