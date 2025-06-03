import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { routes } from './app/app.routes';
import { provideIonicAngular, IonicRouteStrategy } from '@ionic/angular/standalone';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
// Importa la función para registrar iconos
import { registerIcons } from './app/icons';
import { OfflineInterceptor } from './app/interceptors/offline.interceptor';

// Registra los iconos antes de iniciar la aplicación
registerIcons();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: OfflineInterceptor, multi: true },
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideIonicAngular(),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ]
}).catch(err => console.log(err));

// Llama al cargador de elementos después de bootstrapApplication
defineCustomElements(window);