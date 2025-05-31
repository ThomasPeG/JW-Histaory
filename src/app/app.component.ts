import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink, RouterLinkActive]
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Primera Visita', url: '/primera-visita', icon: 'person-add' },
    { title: 'Revisita', url: '/revisita', icon: 'people' },
    { title: 'Studio', url: '/studio', icon: 'business' },
    { title: 'Informe Mes', url: '/informe-mes', icon: 'calendar' },
    { title: 'Por Investigar', url: '/por-investigar', icon: 'search' },
  ];
  public labels = ['JWHistory'];
  
  constructor() {
  }

  
}
