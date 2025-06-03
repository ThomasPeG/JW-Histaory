import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NetworkService } from './services/network.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink, RouterLinkActive]
})
export class AppComponent {

  constructor(
    private networkService: NetworkService
  ) {
    this.networkService.onNetworkChange().subscribe(isOnline => {
      this.isOnline = isOnline;
    });
  }

  public isOnline = true;
  public appPages = [
    { title: 'Mi Perfil', url: '/auth/perfil', icon: 'person' },
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Primera Visita', url: '/primera-visita', icon: 'person-add' },
    { title: 'Revisita', url: '/revisita', icon: 'people' },
    { title: 'Estudio', url: '/studio', icon: 'business' },
    { title: 'Informe Mes', url: '/informe-mes', icon: 'calendar' },
    { title: 'Por Investigar', url: '/por-investigar', icon: 'search' },
  ];
  public labels = ['JWHistory'];
  
  

  
}
