import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, from } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

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
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
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

  async logout(): Promise<void> {
    await Preferences.remove({ key: this.userKey });
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  private async setSession(authResult: AuthResponse): Promise<void> {
    if (authResult.user) {
      await Preferences.set({
        key: this.userKey,
        value: JSON.stringify(authResult.user)
      });
      this.isAuthenticatedSubject.next(true);
    }
  }

  async getUser(): Promise<any> {
    const { value } = await Preferences.get({ key: this.userKey });
    return value ? JSON.parse(value) : null;
  }
  
  async getUserId(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.userKey });
    if (!value) return null;
    
    try {
      const user = JSON.parse(value);
      return user._id;
    } catch {
      return null;
    }
  }

  async hasUser(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.hasUser();
  }
  
  // Método para verificar el estado de autenticación al iniciar
  private async checkAuthStatus(): Promise<void> {
    const isAuthenticated = await this.hasUser();
    this.isAuthenticatedSubject.next(isAuthenticated);
    console.log('Estado de autenticación:', isAuthenticated);
    console.log('API URL:', this.apiUrl);
    console.log('Usuario almacenado:', await this.getUser());
    
    // Añadir este log para depuración
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, las rutas protegidas no se cargarán');
    }
  }
}