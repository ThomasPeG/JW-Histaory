import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms'; // Agregar este import
import { AmoService } from '../../services/amo.service';
import { Amo } from 'src/app/models/formularios.model';
import { RouterModule } from '@angular/router';
import { VisitaFormComponent } from '../../components/visita-form/visita-form.component';
import { Visit } from 'src/app/models/formularios.model';
import { HelpDialogComponent } from '../../components/help-dialog/help-dialog.component';

@Component({
  selector: 'app-primera-visita',
  templateUrl: './primera-visita.page.html',
  styleUrls: ['./primera-visita.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule, RouterModule, VisitaFormComponent, HelpDialogComponent] // Agregar FormsModule aquí
})
export class PrimeraVisitaPage implements OnInit {
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
    private formBuilder: FormBuilder
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

  // Añade esta propiedad a tu clase
  presentingElement: HTMLElement | null = null;
  
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
        this.amos = this.sortAmosByNextVisitDate(amos).filter(amo => amo.visit.length === 1);
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

  // Método para ordenar los amos por fecha de próxima visita
  sortAmosByNextVisitDate(amos: Amo[]): Amo[] {
    return [...amos].sort((a, b) => {
      // Verificar si hay visitas y fechas de próxima visita
      const fechaA = a.visit && a.visit[0] && a.visit[0].nextVisitDate ? new Date(a.visit[0].nextVisitDate) : null;
      const fechaB = b.visit && b.visit[0] && b.visit[0].nextVisitDate ? new Date(b.visit[0].nextVisitDate) : null;
      
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

  // Método para calcular los días restantes hasta la próxima visita
  getDiasRestantes(amo: Amo): number | null {
    if (!amo.visit || !amo.visit[0] || !amo.visit[0].nextVisitDate) {
      return null;
    }
    
    const hoy = new Date();
    const proximaVisita = new Date(amo.visit[0].nextVisitDate);
    
    // Resetear las horas para comparar solo fechas
    hoy.setHours(0, 0, 0, 0);
    proximaVisita.setHours(0, 0, 0, 0);
    
    // Calcular la diferencia en milisegundos y convertir a días
    const diferenciaMilisegundos = proximaVisita.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
    
    return diasRestantes;
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
  openNewAmoModal() {
    this.resetForm();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // Agregar este método para manejar el cambio en la opción "No programar"
  toggleNextVisitDate() {
    const nextVisitDateControl = this.amoForm.get('nextVisitDate');
    
    if (this.skipNextVisit) {
      // Si se selecciona "No programar", eliminar la validación y establecer valor a null
      nextVisitDateControl?.clearValidators();
      nextVisitDateControl?.setValue(null);
    } else {
      // Si se deselecciona, restaurar la validación y establecer fecha por defecto
      nextVisitDateControl?.setValidators(Validators.required);
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      nextVisitDateControl?.setValue(manana.toISOString());
    }
    
    nextVisitDateControl?.updateValueAndValidity();
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

    // Preparar los datos para enviar al servidor
    const formData = this.amoForm.value;
    
    // Crear el objeto de visita
    const visitData = {
      date: formData.date,
      nextVisitDate: this.skipNextVisit ? null : formData.nextVisitDate, // Usar null si skipNextVisit es true
      initialQuestion: formData.initialQuestion,
      ownerConcern: formData.ownerConcern,
      pendingQuestion: formData.pendingQuestion,
      duration: formData.duration,
      notes: formData.notes
    };

    // Crear el objeto amo con la visita
    const amoData = {
      names: formData.names,
      address: formData.address,
      personType: formData.personType,
      personalData: formData.personalData,
      visit: visitData
    };

    // Enviar los datos al servidor
    this.amoService.createAmoByUserId(amoData).subscribe({
      next: (response) => {
        console.log('Amo creado exitosamente:', response);
        this.isSubmitting = false;
        this.closeModal();
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

    // Agregar este método a la clase
    openHelpDialog() {
      this.isHelpDialogOpen = true;
    }

}

