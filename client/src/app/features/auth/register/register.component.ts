import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../core/auth/auth.service';
import { rutValidator } from '../../../shared/validators/rut.validator';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-brand">
        <mat-icon class="auth-brand__icon">account_balance</mat-icon>
        <h1 class="auth-brand__name">Mi Banco</h1>
        <p class="auth-brand__tagline">Crea tu cuenta en segundos</p>
      </div>

      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Crear Cuenta</mat-card-title>
          <mat-card-subtitle>Completa tus datos para registrarte</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (auth.authError()) {
            <div class="auth-error" role="alert">
              <mat-icon>error_outline</mat-icon>
              <span>{{ auth.authError() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
            <mat-stepper [linear]="true" #stepper>
              <!-- Step 1: Personal info -->
              <mat-step [stepControl]="registerForm" label="Datos personales">
                <div class="step-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nombre completo</mat-label>
                    <input matInput
                           formControlName="nombre"
                           autocomplete="name"
                           aria-label="Nombre completo">
                    <mat-icon matPrefix>person</mat-icon>
                    @if (registerForm.get('nombre')?.hasError('required') && registerForm.get('nombre')?.touched) {
                      <mat-error>El nombre es obligatorio</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Correo electronico</mat-label>
                    <input matInput
                           type="email"
                           formControlName="email"
                           autocomplete="email"
                           aria-label="Correo electronico">
                    <mat-icon matPrefix>email</mat-icon>
                    @if (registerForm.get('email')?.hasError('required') && registerForm.get('email')?.touched) {
                      <mat-error>El correo es obligatorio</mat-error>
                    }
                    @if (registerForm.get('email')?.hasError('email')) {
                      <mat-error>Correo invalido</mat-error>
                    }
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-flat-button color="primary" matStepperNext type="button">
                      Continuar
                    </button>
                  </div>
                </div>
              </mat-step>

              <!-- Step 2: Security -->
              <mat-step label="Seguridad">
                <div class="step-content">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>RUT</mat-label>
                    <input matInput
                           formControlName="rut"
                           placeholder="12.345.678-9"
                           autocomplete="username"
                           aria-label="RUT">
                    <mat-icon matPrefix>badge</mat-icon>
                    @if (registerForm.get('rut')?.hasError('required') && registerForm.get('rut')?.touched) {
                      <mat-error>El RUT es obligatorio</mat-error>
                    }
                    @if (registerForm.get('rut')?.hasError('invalidRut')) {
                      <mat-error>RUT invalido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Contrasena</mat-label>
                    <input matInput
                           [type]="hidePassword() ? 'password' : 'text'"
                           formControlName="password"
                           autocomplete="new-password"
                           aria-label="Contrasena">
                    <mat-icon matPrefix>lock</mat-icon>
                    <button mat-icon-button
                            matSuffix
                            type="button"
                            (click)="hidePassword.set(!hidePassword())"
                            [attr.aria-label]="hidePassword() ? 'Mostrar contrasena' : 'Ocultar contrasena'">
                      <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    @if (registerForm.get('password')?.hasError('required') && registerForm.get('password')?.touched) {
                      <mat-error>La contrasena es obligatoria</mat-error>
                    }
                    @if (registerForm.get('password')?.hasError('minlength')) {
                      <mat-error>Minimo 6 caracteres</mat-error>
                    }
                  </mat-form-field>

                  <!-- Password strength indicator -->
                  @if (registerForm.get('password')?.value) {
                    <div class="password-strength">
                      <div class="password-strength__bar"
                           [class]="'password-strength__bar--' + passwordStrength()">
                      </div>
                      <span class="password-strength__label">
                        {{ passwordStrengthLabel() }}
                      </span>
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-button matStepperPrevious type="button">Atras</button>
                    <button mat-flat-button
                            color="primary"
                            type="submit"
                            [disabled]="registerForm.invalid || auth.isLoading()">
                      @if (auth.isLoading()) {
                        <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                        Registrando...
                      } @else {
                        Crear Cuenta
                      }
                    </button>
                  </div>
                </div>
              </mat-step>
            </mat-stepper>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <span class="auth-link-text">Ya tienes cuenta?</span>
          <a mat-button color="primary" routerLink="/auth/login">Iniciar sesion</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #0A2640 0%, #1A4A6D 100%);
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-brand__icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #65E4A3;
    }

    .auth-brand__name {
      font-size: 2rem;
      font-weight: 700;
      color: #ffffff;
      margin: 8px 0 4px;
      letter-spacing: -1px;
    }

    .auth-brand__tagline {
      color: rgba(255,255,255,0.7);
      font-size: 0.9375rem;
      margin: 0;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
      border-radius: 0.5rem !important;
      padding: 8px 16px 16px;
    }

    .auth-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(220,53,69,0.1);
      color: #DC3545;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }

    .auth-error mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .full-width { width: 100%; }

    .step-content {
      padding: 16px 0;
    }

    .step-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    .btn-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    .auth-link-text {
      font-size: 0.875rem;
      color: #757575;
      margin-right: 4px;
    }

    .password-strength {
      margin-bottom: 16px;
    }

    .password-strength__bar {
      height: 4px;
      border-radius: 2px;
      transition: all 300ms ease;
    }

    .password-strength__bar--weak { width: 33%; background: #DC3545; }
    .password-strength__bar--medium { width: 66%; background: #FD7E14; }
    .password-strength__bar--strong { width: 100%; background: #65E4A3; }

    .password-strength__label {
      font-size: 0.75rem;
      color: #757575;
      margin-top: 4px;
      display: block;
    }
  `]
})
export class RegisterComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly hidePassword = signal(true);

  readonly registerForm = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    rut: ['', [Validators.required, rutValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  passwordStrength(): string {
    const pwd = this.registerForm.get('password')?.value ?? '';
    if (pwd.length < 6) return 'weak';
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
    return 'medium';
  }

  passwordStrengthLabel(): string {
    const s = this.passwordStrength();
    return s === 'weak' ? 'Debil' : s === 'medium' ? 'Media' : 'Fuerte';
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.auth.clearError();
    const data = this.registerForm.getRawValue();

    this.auth.register(data).subscribe(success => {
      if (success) {
        this.snackBar.open('Cuenta creada exitosamente. Inicia sesion.', 'Cerrar', {
          duration: 5000,
          panelClass: 'success-snackbar'
        });
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
