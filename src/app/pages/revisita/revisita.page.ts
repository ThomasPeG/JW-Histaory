import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-revisita',
  templateUrl: './revisita.page.html',
  styleUrls: ['./revisita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RevisitaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
