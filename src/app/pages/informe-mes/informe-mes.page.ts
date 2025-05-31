import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-informe-mes',
  templateUrl: './informe-mes.page.html',
  styleUrls: ['./informe-mes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class InformeMesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
