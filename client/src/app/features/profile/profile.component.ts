import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/auth/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { rutValidator } from '../../shared/validators/rut.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatChipsModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header
      title="Mi Perfil"
      subtitle="Visualiza y edita tu informacion personal"
      icon="person">
    </app-page-header>

    <div class="profile-layout">
      <!-- Profile Summary Card -->
      <mat-card class="profile-summary-card">
        <mat-card-content>
          <div class="profile-avatar">
            <mat-icon class="profile-avatar__icon">account_circle</mat-icon>
          </div>
          <h2 class="profile-name">{{ auth.userName() }}</h2>
          <p class="profile-rut">RUT: {{ auth.userRut() }}</p>
          <mat-chip-set>
            <mat-chip class="chip-success">
              <mat-icon>verified</mat-icon>
              Cuenta Verificada
            </mat-chip>
          </mat-chip-set>
        </mat-card-content>
      </mat-card>

      <!-- Edit Profile Card -->
      <mat-card class="profile-edit-card">
        <mat-card-header>
          <mat-card-title>Datos de Contacto</mat-card-title>
          <mat-card-subtitle>Mantiene tus datos actualizados</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSave()" novalidate>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="nombre">
              <mat-icon matPrefix>person</mat-icon>
              @if (profileForm.get('nombre')?.hasError('required') && profileForm.get('nombre')?.touched) {
                <mat-error>El nombre es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Correo electronico</mat-label>
              <input matInput type="email" formControlName="email">
              <mat-icon matPrefix>email</mat-icon>
              @if (profileForm.get('email')?.hasError('email')) {
                <mat-error>Correo invalido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>RUT</mat-label>
              <input matInput formControlName="rut" readonly>
              <mat-icon matPrefix>badge</mat-icon>
              <mat-hint>El RUT no se puede modificar</mat-hint>
            </mat-form-field>

            <mat-divider class="form-divider"></mat-divider>

            <!-- Security section -->
            <h3 class="section-title">Seguridad</h3>
            <p class="section-description">
              La autenticacion biometrica (WebAuthn) estara disponible proximamente
              para una experiencia sin contrasenas.
            </p>

            <div class="security-features">
              <div class="security-item">
                <mat-icon class="security-item__icon">lock</mat-icon>
                <div>
                  <strong>Contrasena</strong>
                  <p>Ultima actualizacion: hoy</p>
                </div>
                <button mat-stroked-button disabled>Cambiar</button>
              </div>
              <div class="security-item">
                <mat-icon class="security-item__icon">fingerprint</mat-icon>
                <div>
                  <strong>Biometria (WebAuthn)</strong>
                  <p>Proximamente disponible</p>
                </div>
                <mat-chip>Pronto</mat-chip>
              </div>
            </div>

            <div class="form-actions">
              <button mat-flat-button
                      color="primary"
                      type="submit"
                      [disabled]="profileForm.invalid || !profileForm.dirty"
                      class="submit-btn">
                <mat-icon>save</mat-icon>
                Guardar Cambios
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }

    .profile-summary-card,
    .profile-edit-card {
      border-radius: 16px !important;
    }

    .profile-summary-card {
      text-align: center;
      padding: 24px 16px;
    }

    .profile-avatar {
      margin-bottom: 16px;
    }

    .profile-avatar__icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #1976D2;
    }

    .profile-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .profile-rut {
      color: #757575;
      font-size: 0.875rem;
      margin: 0 0 16px;
    }

    .full-width { width: 100%; }

    .form-divider { margin: 24px 0; }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .section-description {
      color: #757575;
      font-size: 0.875rem;
      margin: 0 0 20px;
    }

    .security-features {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 24px;
    }

    .security-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      background: #F5F5F5;
    }

    .security-item__icon {
      color: #1976D2;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .security-item div {
      flex: 1;
    }

    .security-item div strong { display: block; font-size: 0.9375rem; }
    .security-item div p { margin: 2px 0 0; color: #757575; font-size: 0.8125rem; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
    }

    .submit-btn {
      height: 48px;
      padding: 0 32px;
      border-radius: 12px !important;
    }

    .submit-btn mat-icon { margin-right: 8px; }

    .chip-success {
      --mat-chip-elevated-container-color: #C8E6C9;
      --mat-chip-label-text-color: #388E3C;
    }
  `]
})
export class ProfileComponent {
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly profileForm = this.fb.nonNullable.group({
    nombre: [this.auth.currentUser()?.nombre ?? '', Validators.required],
    email: [this.auth.currentUser()?.email ?? '', [Validators.email]],
    rut: [{ value: this.auth.userRut(), disabled: true }]
  });

  onSave(): void {
    if (this.profileForm.invalid) return;

    // Profile update would call backend in production
    this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });
    this.profileForm.markAsPristine();
  }
}
