import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicModule, IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Agregar este import
import { AmoService } from '../../services/amo.service';
import { Amo } from 'src/app/models/formularios.model';
import { RouterModule } from '@angular/router';
import { VisitaFormComponent } from '../../components/visita-form/visita-form.component';
import { Visit } from 'src/app/models/formularios.model';
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-primera-visita',
  templateUrl: './primera-visita.page.html',
  styleUrls: ['./primera-visita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule, RouterModule, VisitaFormComponent, HelpDialogComponent] // Agregar FormsModule aquí
})
export class PrimeraVisitaPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  amos: Amo[] = [];
  loading: boolean = true;
  error: string | null = null;
  expandedVisita: string | null = null;
  
  // Variables para el modal y formulario
  isModalOpen: boolean = false;
  isRevisitaModalOpen: boolean = false;
  amoForm: FormGroup;
  isSubmitting: boolean = false;
  selectedAmo: Amo | null = null;
  skipNextVisit: boolean = false; // Agregar esta propiedad

  constructor(
    private amoService: AmoService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService
  ) {
    // Inicializar el formulario
    this.amoForm = this.formBuilder.group({
      date: ['', Validators.required],
      nextVisitDate: ['', Validators.required],
      names: ['', Validators.required],
      initialQuestion: ['', Validators.required],
      address: ['', Validators.required],
      personType: ['', Validators.required],
      ownerConcern: [''],
      personalData: [''],
      pendingQuestion: [''],
      duration: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }
  
  ngOnInit() {
    this.loadVisitas();
  }

  loadVisitas() {
    this.loading = true;
    this.amoService.getAmosByUserId().subscribe({
      next: (amos: Amo[]) => {
        // Ordenar los amos por fecha de próxima visita (la más cercana primero)
        this.amos = this.sortAmosByNextVisitDate(amos).filter(amo => amo.visit.length === 1);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar las visitas:', err);
        this.error = 'Error al cargar la información de las visitas';
        this.loading = false;
      }
    });
  }

  // Método para ordenar los amos por fecha de próxima visita
  // Reemplazar los métodos existentes con llamadas al servicio
  sortAmosByNextVisitDate(amos: Amo[]): Amo[] {
    return this.utilsService.sortAmosByNextVisitDate(amos, true);
  }

  getDiasRestantes(amo: Amo): number | null {
    return this.utilsService.getDiasRestantes(amo, true);
  }

  getColorClase(diasRestantes: number | null): string {
    return this.utilsService.getColorClase(diasRestantes);
  }

  toggleNextVisitDate() {
    const nextVisitDateControl : any = this.amoForm.get('nextVisitDate');
    if (nextVisitDateControl) {
      this.utilsService.toggleNextVisitDate(nextVisitDateControl, this.skipNextVisit);
    }
  }

  // Métodos para el modal
  openNewAmoModal() {
    this.resetForm();
    this.isModalOpen = true;
  }
  // Agregar este método para manejar el cambio en la opción "No programar"
 

  resetForm() {
    // Obtener la fecha de hoy y mañana
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    
    // Formatear las fechas para el formato ISO que espera Ionic
    const hoyISO = hoy.toISOString();
    const mananaISO = manana.toISOString();
    
    // Resetear el formulario con valores por defecto
    this.amoForm.reset();
    this.amoForm.patchValue({
      date: hoyISO,
      nextVisitDate: mananaISO
    });
    this.isSubmitting = false;
    
    // Resetear la opción de saltar próxima visita
    this.skipNextVisit = false;
  }

  submitForm() {
    if (this.amoForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.amoForm.controls).forEach(key => {
        const control = this.amoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isSubmitting = true;
    // Crear el objeto de visita
    const visitData = {
      date: this.amoForm.value.date,
      nextVisitDate: this.skipNextVisit ? null : this.amoForm.value.nextVisitDate, // Usar null si skipNextVisit es true
      initialQuestion: this.amoForm.value.initialQuestion,
      ownerConcern: this.amoForm.value.ownerConcern,
      pendingQuestion: this.amoForm.value.pendingQuestion,
      duration: this.amoForm.value.duration,
      notes: this.amoForm.value.notes
    };

    // Crear el objeto amo con la visita
    const amoData = {
      names: this.amoForm.value.names,
      address: this.amoForm.value.address,
      personType: this.amoForm.value.personType,
      personalData: this.amoForm.value.personalData,
      visit: visitData
    };

    // Enviar los datos al servidor
    this.amoService.createAmoByUserId(amoData).subscribe({
      next: (response) => {
        console.log('Amo creado exitosamente:', response);
        this.isSubmitting = false;
        this.isModalOpen = false;
        // Recargar la lista de amos
        this.loadVisitas();
      },
      error: (err) => {
        console.error('Error al crear el amo:', err);
        this.isSubmitting = false;
        // Aquí podrías mostrar un mensaje de error
      }
    });
  }

  // Métodos para el modal de revisita
  openRevisitaModal(amo: Amo) {
    this.selectedAmo = amo;
    this.isRevisitaModalOpen = true;
  }

  closeRevisitaModal() {
    this.isRevisitaModalOpen = false;
    // Devolver el foco a un elemento apropiado
    const button = document.querySelector('.nuevo-amo-btn');
    if (button) {
      (button as HTMLElement).focus();
    }
  }

  handleVisitSubmit(visitData: Visit) {
    this.isSubmitting = true;

    if (this.selectedAmo) {
      // Agregar nueva visita al amo seleccionado
      this.amoService.createVisitAmoById({
        amoId: this.selectedAmo._id,
        visit: visitData
      }).subscribe({
        next: (response) => {
          console.log('Revisita agregada exitosamente:', response);
          this.isSubmitting = false;
          this.closeRevisitaModal();
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
      this.isSubmitting = false;
      this.error = 'Error: No se ha seleccionado un amo para la revisita';
    }
  }
  // Agregar estas propiedades a la clase
    isHelpDialogOpen: boolean = false;
    helpContent: string = `
      <p><strong>¿Qué puedes hacer en esta página?</strong></p>
      <p>En esta página podrás registrar nuevas personas interesadas (amos) y sus primeras visitas.</p>
      <ul>
        <li><strong>Nuevo Amo:</strong> Registra una nueva persona interesada y su primera visita.</li>
        <li><strong>Lista de Amos:</strong> Visualiza todas las personas que has visitado.</li>
        <li><strong>Próxima Visita:</strong> Verifica cuándo debes realizar la próxima visita.</li>
        <li><strong>Agregar Revisita:</strong> Programa una nueva visita a un contacto existente.</li>
        <li><strong>Ver Detalles:</strong> Consulta toda la información de un contacto.</li>
      </ul>
    `;
}

 


