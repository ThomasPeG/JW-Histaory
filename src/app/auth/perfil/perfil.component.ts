import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class PerfilComponent implements OnInit {
  perfilForm: FormGroup;
  usuario: any = null;
  isEditing = false;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.perfilForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    this.usuario = this.authService.getUser();
    if (this.usuario) {
      this.perfilForm.patchValue({
        name: this.usuario.name,
        email: this.usuario.email
      });
    }
  }

  toggleEditing() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Si cancelamos la edición, restauramos los valores originales
      this.cargarDatosUsuario();
    }
  }

  async guardarCambios() {
    if (this.perfilForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    // Aquí normalmente enviarías los cambios al backend
    // Como no tenemos esa funcionalidad implementada, simularemos una actualización local
    try {
      // Simulación de actualización exitosa
      setTimeout(async () => {
        // Actualizar datos localmente (en una app real, esto vendría del backend)
        const usuarioActualizado = {
          ...this.usuario,
          name: this.perfilForm.value.name,
          email: this.perfilForm.value.email
        };
        
        // Actualizar en localStorage
        localStorage.setItem('auth_user', JSON.stringify(usuarioActualizado));
        
        // Recargar datos
        this.cargarDatosUsuario();
        
        const toast = await this.toastController.create({
          message: 'Perfil actualizado correctamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        this.isSubmitting = false;
        this.isEditing = false;
      }, 1000); // Simulamos un retraso de red
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const toast = await this.toastController.create({
        message: 'Error al actualizar el perfil',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      this.isSubmitting = false;
    }
  }

  cerrarSesion() {
    this.authService.logout();
  }
}
