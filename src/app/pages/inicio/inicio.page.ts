import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AmoService } from '../../services/amo.service';
import { Amo } from '../../models/formularios.model';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class InicioPage implements OnInit {
  amos: Amo[] = [];
  primerasVisitas: Amo[] = [];
  revisitas: Amo[] = [];
  estudios: number = 0;
  porInvestigar: number = 0;
  cargando: boolean = true;

  constructor(private amoService: AmoService) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.amoService.getAmosByUserId().subscribe({
      next: (data) => {
        this.amos = data;
        this.procesarDatos();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar los amos:', error);
        this.cargando = false;
      }
    });
  }

  procesarDatos() {
    // Filtrar primeras visitas (amos con una sola visita)
    this.primerasVisitas = this.amos.filter(amo => amo.visit && amo.visit.length === 1);
    
    // Filtrar revisitas (amos con dos o más visitas)
    this.revisitas = this.amos.filter(amo => amo.visit && amo.visit.length >= 2);
    
    // Aquí podrías agregar lógica para contar estudios y por investigar si tienes esa información
  }
}
