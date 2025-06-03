import { Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HelpDialogComponent {
  @Input() title: string = 'Ayuda';
  @Input() content: string = '';
  @Input() isOpen: boolean = false;

  closeDialog() {
    this.isOpen = false;
  }
}