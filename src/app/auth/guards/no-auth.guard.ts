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
    // Verificar explícitamente si hay un usuario en localStorage
    const user = localStorage.getItem('auth_user');
    
    if (!user) {
      // Si no hay usuario, permitir acceso a las rutas de autenticación
      return true;
    }
    
    // Si hay usuario, redirigir a la página principal
    console.log('Usuario autenticado, redirigiendo a inicio');
    return this.router.createUrlTree(['/inicio']);
  }
}