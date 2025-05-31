import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  
  }

  ngOnInit() {}

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    this.authService.login(
      this.loginForm.value.email,
      this.loginForm.value.password
    ).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Inicio de sesión exitoso',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        
        // Redirigir al usuario a la página principal después del login
        this.router.navigate(['/inicio']);
      },
      error: async (error) => {
        console.error('Error al iniciar sesión:', error);
        const toast = await this.toastController.create({
          message: 'Error al iniciar sesión. Verifica tus credenciales.',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}
