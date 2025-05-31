import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primera-visita',
  templateUrl: './primera-visita.page.html',
  styleUrls: ['./primera-visita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class PrimeraVisitaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
