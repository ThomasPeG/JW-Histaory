import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';

@Component({
  selector: 'app-studio',
  templateUrl: './studio.page.html',
  styleUrls: ['./studio.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HelpDialogComponent]
})
export class StudioPage implements OnInit {
  // Propiedades para el diálogo de ayuda
  isHelpDialogOpen: boolean = false;
  helpContent: string = `
    <p><strong>¿Qué podrás hacer en esta sección?</strong></p>
    <p>La sección "Estudio" está diseñada para ayudarte a gestionar y dar seguimiento a tus estudios bíblicos.</p>
    <ul>
      <li><strong>Registrar estudiantes:</strong> Mantén un registro de las personas con las que estás estudiando la Biblia.</li>
      <li><strong>Seguimiento de progreso:</strong> Registra qué publicaciones y temas has cubierto con cada estudiante.</li>
      <li><strong>Programar sesiones:</strong> Organiza las fechas y horarios de tus próximos estudios.</li>
      <li><strong>Tomar notas:</strong> Guarda observaciones importantes sobre el progreso y los intereses de cada estudiante.</li>
      <li><strong>Establecer metas:</strong> Define objetivos para cada estudio y celebra cuando se alcancen.</li>
    </ul>
    <p><em>Esta función te ayudará a ser más efectivo en tu labor de enseñanza bíblica.</em></p>
  `;

  constructor() { }

  ngOnInit() {
  }

  // Método para abrir el diálogo de ayuda
  openHelpDialog() {
    this.isHelpDialogOpen = true;
  }
}
