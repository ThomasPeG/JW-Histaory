import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AmoService } from '../../services/amo.service';
import { Amo } from 'src/app/models/formularios.model';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VisitaFormComponent } from '../../components/visita-form/visita-form.component';
import { Visit } from 'src/app/models/formularios.model';
// Agregar al import de componentes
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';

@Component({
  selector: 'app-revisita',
  templateUrl: './revisita.page.html',
  styleUrls: ['./revisita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule, RouterModule, VisitaFormComponent, HelpDialogComponent]
})
export class RevisitaPage implements OnInit {
  amos: Amo[] = [];
  filteredAmos: Amo[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;
  expandedVisita: string | null = null;
  
  // Variables para el modal y formulario
  isModalOpen: boolean = false;
  revisitaForm: FormGroup;
  isSubmitting: boolean = false;
  editMode: boolean = false;
  selectedAmo: Amo | null = null;

  constructor(
    private amoService: AmoService,
    private formBuilder: FormBuilder
  ) {
    // Inicializar el formulario
    this.revisitaForm = this.formBuilder.group({
      date: ['', Validators.required],
      nextVisitDate: ['', Validators.required],
      initialQuestion: ['', Validators.required],
      pendingQuestion: [''],
      newPendingQuestion: [''],
      ownerConcern: [''],
      duration: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  // Añade esta propiedad a tu clase
  presentingElement: HTMLElement | null = null;
  
  // En el método ngOnInit, añade esto
  ngOnInit() {
    this.loadVisitas();
    this.presentingElement = document.querySelector('.ion-page');
  }

  loadVisitas() {
    this.loading = true;
    this.amoService.getAmosByUserId().subscribe({
      next: (amos: Amo[]) => {
        console.log('Amos cargados:', amos);
        // Ordenar los amos por fecha de próxima visita (la más cercana primero)
        this.amos = this.sortAmosByNextVisitDate(amos);
        this.filteredAmos = [...this.amos]; // Inicializar filteredAmos con todos los amos
        console.log('Amos ordenados:', this.amos);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar las visitas:', err);
        this.error = 'Error al cargar la información de las visitas';
        this.loading = false;
      }
    });
  }

  // Método para filtrar amos según el término de búsqueda
  filterAmos() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredAmos = [...this.amos];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAmos = this.amos.filter(amo => 
      amo.names.toLowerCase().includes(term) || 
      amo.address.toLowerCase().includes(term)
    );
  }

  // Método para calcular los días restantes hasta la próxima visita
  getDiasRestantes(amo: Amo): number | null {
    if (!amo.visit || amo.visit.length === 0 || !amo.visit[amo.visit.length - 1].nextVisitDate) {
      return null;
    }
    
    const hoy = new Date();
    const proximaVisita = new Date(amo.visit[amo.visit.length - 1].nextVisitDate);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    proximaVisita.setHours(0, 0, 0, 0);
    
    // Calcular la diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = proximaVisita.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    return diasRestantes;
  }

  // Método para ordenar los amos por fecha de próxima visita
  sortAmosByNextVisitDate(amos: Amo[]): Amo[] {
    return [...amos].sort((a, b) => {
      // Verificar si hay visitas y fechas de próxima visita
      const fechaA = a.visit && a.visit.length > 0 ? 
        new Date(a.visit[a.visit.length - 1].nextVisitDate) : null;
      const fechaB = b.visit && b.visit.length > 0 ? 
        new Date(b.visit[b.visit.length - 1].nextVisitDate) : null;
      
      // Si ambos tienen fecha, comparar normalmente
      if (fechaA && fechaB) {
        return fechaA.getTime() - fechaB.getTime();
      }
      
      // Si solo uno tiene fecha, ponerlo primero
      if (fechaA) return -1;
      if (fechaB) return 1;
      
      // Si ninguno tiene fecha, mantener el orden original
      return 0;
    });
  }

  // Método para determinar la clase CSS según los días restantes
  getColorClase(diasRestantes: number | null): string {
    if (diasRestantes === null) {
      return 'sin-fecha';
    }
    
    if (diasRestantes < 2) {
      return 'dias-urgente'; // Rojo
    } else if (diasRestantes <= 7) {
      return 'dias-proximo'; // Amarillo
    } else {
      return 'dias-normal'; // Verde
    }
  }

  // Métodos para el modal
  openNewRevisitaModal() {
    this.editMode = false;
    this.selectedAmo = null;
    this.resetForm();
    this.isModalOpen = true;
  }

  openRevisitaModal(amo: Amo) {
    this.editMode = true;
    this.selectedAmo = amo;
    this.resetForm();
    
    // Cargar datos del amo seleccionado en el formulario
    if (amo.visit && amo.visit[0]) {
      this.revisitaForm.patchValue({
        pendingQuestion: amo.visit[0].pendingQuestion || ''
      });
    }
    
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    // Devolver el foco a un elemento apropiado
    const button = document.querySelector('.add-btn');
    if (button) {
      (button as HTMLElement).focus();
    }
  }

  resetForm() {
    // Obtener la fecha de hoy y mañana
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    
    // Formatear las fechas para el formato ISO que espera Ionic
    const hoyISO = hoy.toISOString();
    const mananaISO = manana.toISOString();
    
    // Resetear el formulario con valores por defecto
    this.revisitaForm.reset();
    this.revisitaForm.patchValue({
      date: hoyISO,
      nextVisitDate: mananaISO
    });
    this.isSubmitting = false;
  }


  handleVisitSubmit(visitData: Visit) {
    this.isSubmitting = true;

    if (this.editMode && this.selectedAmo) {
      // Actualizar amo existente con nueva visita
      this.amoService.createVisitAmoById({
        amoId: this.selectedAmo._id,
        visit: visitData
      }).subscribe({
        next: (response) => {
          console.log('Revisita agregada exitosamente:', response);
          this.isSubmitting = false;
          this.closeModal();
          // Recargar la lista de amos
          this.loadVisitas();
        },
        error: (err) => {
          console.error('Error al agregar la revisita:', err);
          this.isSubmitting = false;
          // Aquí podrías mostrar un mensaje de error
        }
      });
    } else {
      // Este caso no debería ocurrir en la página de revisita
      this.isSubmitting = false;
      this.error = 'Error: No se ha seleccionado un amo para la revisita';
    }
  }
  // Método para manejar la presentación del formulario
  

  toggleDetails(visitaId: string) {
    if (this.expandedVisita === visitaId) {
      this.expandedVisita = null; // Colapsar si ya está expandido
    } else {
      this.expandedVisita = visitaId; // Expandir si está colapsado
    }
  }

  isExpanded(amoId: string): boolean {
    return this.expandedVisita === amoId;
  }


  // Agregar estas propiedades a la clase
  isHelpDialogOpen: boolean = false;
  helpContent: string = `
    <p><strong>¿Qué puedes hacer en esta página?</strong></p>
    <p>En esta página podrás gestionar las revisitas a las personas interesadas.</p>
    <ul>
      <li><strong>Buscar:</strong> Encuentra rápidamente a una persona por su nombre o dirección.</li>
      <li><strong>Filtrar:</strong> Visualiza las personas que necesitan ser revisitadas pronto.</li>
      <li><strong>Agregar Revisita:</strong> Registra una nueva visita a un contacto existente.</li>
      <li><strong>Ver Detalles:</strong> Consulta el historial completo de visitas de un contacto.</li>
    </ul>
  `;

  // Agregar este método a la clase
  openHelpDialog() {
    this.isHelpDialogOpen = true;
  }
}


