import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }

  private async checkAuth(): Promise<boolean | UrlTree> {
    if (await this.authService.isLoggedIn()) {
      return true;
    }
    
    // Redirigir al usuario a la página de login si no está autenticado
    return this.router.createUrlTree(['/auth/login']);
  }
}