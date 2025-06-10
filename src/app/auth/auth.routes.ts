import { Routes } from '@angular/router';
import { AuthPage } from './auth.page';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NoAuthGuard } from './guards/no-auth.guard';
import { AuthGuard } from './guards/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthPage,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [NoAuthGuard]
      },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [NoAuthGuard]
      },
      {
        path: 'perfil',
        component: PerfilComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];