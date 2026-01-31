import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { rutValidator } from '../../../shared/validators/rut.validator';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-brand">
        <mat-icon class="auth-brand__icon">account_balance</mat-icon>
        <h1 class="auth-brand__name">Mi Banco</h1>
        <p class="auth-brand__tagline">Tu banco digital de confianza</p>
      </div>

      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Iniciar Sesion</mat-card-title>
          <mat-card-subtitle>Ingresa tus credenciales para acceder</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (auth.authError()) {
            <div class="auth-error" role="alert">
              <mat-icon>error_outline</mat-icon>
              <span>{{ auth.authError() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>RUT</mat-label>
              <input matInput
                     formControlName="rut"
                     placeholder="12.345.678-9"
                     autocomplete="username"
                     aria-label="Ingrese su RUT">
              <mat-icon matPrefix>badge</mat-icon>
              @if (loginForm.get('rut')?.hasError('required') && loginForm.get('rut')?.touched) {
                <mat-error>El RUT es obligatorio</mat-error>
              }
              @if (loginForm.get('rut')?.hasError('invalidRut')) {
                <mat-error>RUT invalido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Contrasena</mat-label>
              <input matInput
                     [type]="hidePassword() ? 'password' : 'text'"
                     formControlName="password"
                     autocomplete="current-password"
                     aria-label="Ingrese su contrasena">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button
                      matSuffix
                      type="button"
                      (click)="hidePassword.set(!hidePassword())"
                      [attr.aria-label]="hidePassword() ? 'Mostrar contrasena' : 'Ocultar contrasena'">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>La contrasena es obligatoria</mat-error>
              }
              @if (loginForm.get('password')?.hasError('minlength')) {
                <mat-error>Minimo 6 caracteres</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button
                    color="primary"
                    type="submit"
                    class="full-width submit-btn"
                    [disabled]="loginForm.invalid || auth.isLoading()">
              @if (auth.isLoading()) {
                <mat-spinner diameter="20" class="btn-spinner"></mat-spinner>
                Ingresando...
              } @else {
                Iniciar Sesion
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <span class="auth-link-text">No tienes cuenta?</span>
          <a mat-button color="primary" routerLink="/auth/register">Crear cuenta</a>
        </mat-card-actions>
      </mat-card>

      <p class="auth-footer">
        Protegido con encriptacion de extremo a extremo
        <mat-icon class="auth-footer__icon">verified_user</mat-icon>
      </p>
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
      background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #E8EAF6 100%);
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-brand__icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976D2;
    }

    .auth-brand__name {
      font-size: 2rem;
      font-weight: 700;
      color: #1565C0;
      margin: 8px 0 4px;
      letter-spacing: -1px;
    }

    .auth-brand__tagline {
      color: #616161;
      font-size: 0.9375rem;
      margin: 0;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      border-radius: 20px !important;
      padding: 8px 16px 16px;
    }

    .auth-error {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 8px;
      background: rgba(211, 47, 47, 0.08);
      color: #C62828;
      margin-bottom: 16px;
      font-size: 0.875rem;
    }

    .auth-error mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 8px;
      border-radius: 12px !important;
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

    .auth-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 24px;
      font-size: 0.8125rem;
      color: #757575;
    }

    .auth-footer__icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #43A047;
    }
  `]
})
export class LoginComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly hidePassword = signal(true);

  readonly loginForm = this.fb.nonNullable.group({
    rut: ['', [Validators.required, rutValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.auth.clearError();
    const { rut, password } = this.loginForm.getRawValue();

    this.auth.login({ rut, password }).subscribe(success => {
      if (success) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
        this.snackBar.open('Bienvenido a Mi Banco', 'Cerrar', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      }
    });
  }
}
