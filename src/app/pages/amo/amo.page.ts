import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AmoService } from '../../services/amo.service';
import { Amo, Visit } from '../../models/formularios.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { VisitaFormComponent } from '../../components/visita-form/visita-form.component';

@Component({
  selector: 'app-amo',
  templateUrl: './amo.page.html',
  styleUrls: ['./amo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, ReactiveFormsModule, VisitaFormComponent]
})
export class AmoPage implements OnInit {
  amoId: string | null = null;
  amo: Amo | null = null;
  loading: boolean = true;
  error: string | null = null;
  isModalOpen: boolean = false;
  visitForm: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private amoService: AmoService,
    private formBuilder: FormBuilder
  ) {
    // Inicializar el formulario
    this.visitForm = this.formBuilder.group({
      date: ['', Validators.required],
      nextVisitDate: ['', Validators.required],
      initialQuestion: ['', Validators.required],
      pendingQuestion: [''],
      ownerConcern: [''],
      duration: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit() {
    // Obtener el ID del amo de los parámetros de la URL
    this.amoId = this.route.snapshot.paramMap.get('id');
    
    if (this.amoId) {
      this.loadAmoData();
    } else {
      this.error = 'ID de amo no proporcionado';
      this.loading = false;
    }
  }

  loadAmoData() {
    if (!this.amoId) return;
    
    this.loading = true;
    this.amoService.getAmoById(this.amoId).subscribe({
      next: (data) => {
        this.amo = data;
        // Ordenar las visitas por fecha (la más antigua primero)
        if (this.amo && this.amo.visit) {
          this.amo.visit.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del amo:', err);
        this.error = 'Error al cargar la información del amo';
        this.loading = false;
      }
    });
  }

  openNewVisitModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

 

  handleVisitSubmit(visitData: Visit) {
    this.isSubmitting = true;

    if (this.amoId) {
      // Agregar nueva visita al amo
      this.amoService.createVisitAmoById({
        amoId: this.amoId,
        visit: visitData
      }).subscribe({
        next: (response) => {
          console.log('Visita agregada exitosamente:', response);
          this.isSubmitting = false;
          this.closeModal();
          // Recargar los datos del amo
          this.loadAmoData();
        },
        error: (err) => {
          console.error('Error al agregar la visita:', err);
          this.isSubmitting = false;
          // Aquí podrías mostrar un mensaje de error
        }
      });
    }
  }
}
