import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}
  
  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.checkAuth();
  }
  private async checkAuth(): Promise<boolean | UrlTree> {
    if (!await this.authService.isLoggedIn()) {
      return true;
    }
    
    // Si hay usuario, redirigir a la página principal
    console.log('Usuario autenticado, redirigiendo a inicio');
    return this.router.createUrlTree(['/inicio']);
  }
}