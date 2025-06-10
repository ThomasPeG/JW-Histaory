import { Routes } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { AUTH_ROUTES } from './auth/auth.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then(m => m.InicioPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'studio',
    loadComponent: () => import('./pages/studio/studio.page').then(m => m.StudioPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'informe-mes',
    loadComponent: () => import('./pages/informe-mes/informe-mes.page').then(m => m.InformeMesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'por-investigar',
    loadComponent: () => import('./pages/por-investigar/por-investigar.page').then(m => m.PorInvestigarPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'primera-visita',
    loadComponent: () => import('./pages/primera-visita/primera-visita.page').then(m => m.PrimeraVisitaPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'revisita',
    loadComponent: () => import('./pages/revisita/revisita.page').then(m => m.RevisitaPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'amo/:id',
    loadComponent: () => import('./pages/amo/amo.page').then(m => m.AmoPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'folder/:id',
    loadComponent: () => import('./folder/folder.page').then(m => m.FolderPage),
    canActivate: [AuthGuard]
  }
];