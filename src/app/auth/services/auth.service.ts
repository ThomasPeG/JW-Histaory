import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api`;
  private userKey = 'auth_user';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasUser());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Verificar usuario al iniciar el servicio
    this.checkAuthStatus();
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
    .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  private setSession(authResult: AuthResponse): void {
    if (authResult.user) {
      localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
      this.isAuthenticatedSubject.next(true);
    }
  }

  getUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }
  getUserId(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem(this.userKey);
      if (!userData) return null;
      
      try {
        const user = JSON.parse(userData);
        return user._id;
      } catch {
        return null;
      }
    }
    return null;
  }

  hasUser(): boolean {
    return !!this.getUser();
  }

  isLoggedIn(): boolean {
    return this.hasUser();
  }
  
  // Método para verificar el estado de autenticación al iniciar
  private checkAuthStatus(): void {
    const isAuthenticated = this.hasUser();
    this.isAuthenticatedSubject.next(isAuthenticated);
    console.log('Estado de autenticación:', isAuthenticated);
    console.log('API URL:', this.apiUrl);
    console.log('Usuario almacenado:', this.getUser());
  }
}