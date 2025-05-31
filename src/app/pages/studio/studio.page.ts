import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.page.html',
  styleUrls: ['./studio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class StudioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
