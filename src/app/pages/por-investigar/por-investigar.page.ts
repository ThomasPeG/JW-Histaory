import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';

@Component({
  selector: 'app-por-investigar',
  templateUrl: './por-investigar.page.html',
  styleUrls: ['./por-investigar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HelpDialogComponent]
})
export class PorInvestigarPage implements OnInit {
  // Propiedades para el diálogo de ayuda
  isHelpDialogOpen: boolean = false;
  helpContent: string = `
    <p><strong>¿Qué podrás hacer en esta sección?</strong></p>
    <p>La sección "Por Investigar" está diseñada para ayudarte a registrar y organizar temas bíblicos que necesitas estudiar con más profundidad.</p>
    <ul>
      <li><strong>Registrar preguntas:</strong> Anota preguntas difíciles que surjan durante tus visitas.</li>
      <li><strong>Organizar temas:</strong> Clasifica los temas por urgencia o contacto.</li>
      <li><strong>Guardar referencias:</strong> Asocia textos bíblicos y publicaciones a cada tema.</li>
      <li><strong>Seguimiento:</strong> Marca temas como completados cuando estés listo para compartir la información.</li>
    </ul>
    <p><em>Esta función te ayudará a estar mejor preparado para tus próximas visitas y estudios bíblicos.</em></p>
  `;

  constructor() { }

  ngOnInit() {
  }

  // Método para abrir el diálogo de ayuda
  openHelpDialog() {
    this.isHelpDialogOpen = true;
  }
}
