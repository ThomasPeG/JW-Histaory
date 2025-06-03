import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Visit } from 'src/app/models/formularios.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visita-form',
  templateUrl: './visita-form.component.html',
  styleUrls: ['./visita-form.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, FormsModule]
})
export class VisitaFormComponent implements OnInit {
  @Input() isSubmitting: boolean = false;
  @Input() title: string = 'Nueva Visita';
  @Output() formSubmit = new EventEmitter<Visit>();
  @Output() cancelForm = new EventEmitter<void>();

  visitaForm: FormGroup;
  skipNextVisit: boolean = false;

  constructor(private formBuilder: FormBuilder) {
    // Inicializar el formulario
    this.visitaForm = this.formBuilder.group({
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

  ngOnInit() {
    this.resetForm();
  }

  toggleNextVisitDate() {
    const nextVisitDateControl = this.visitaForm.get('nextVisitDate');
    
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
    this.visitaForm.reset();
    this.visitaForm.patchValue({
      date: hoyISO,
      nextVisitDate: mananaISO
    });
    
    // Resetear la opción de saltar próxima visita
    this.skipNextVisit = false;
    this.toggleNextVisitDate();
  }

  submitForm() {
    if (this.visitaForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.visitaForm.controls).forEach(key => {
        const control = this.visitaForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Preparar los datos para enviar
    const formData = this.visitaForm.value;
    
    // Crear el objeto de visita
    const visitData: Visit = {
      date: formData.date,
      nextVisitDate: this.skipNextVisit ? null : formData.nextVisitDate,
      initialQuestion: formData.initialQuestion,
      ownerConcern: formData.ownerConcern,
      pendingQuestion: formData.newPendingQuestion,
      duration: formData.duration,
      notes: formData.notes
    };

    // Emitir el evento con los datos del formulario
    this.formSubmit.emit(visitData);
  }

  cancel() {
    this.cancelForm.emit();
  }
}