import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/auth/auth.service';
import { TransferService } from '../../../core/services/transfer.service';
import { BankService } from '../../../core/services/bank.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { rutValidator } from '../../../shared/validators/rut.validator';

@Component({
  selector: 'app-new-beneficiary',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <app-page-header
      title="Registrar Destinatario"
      subtitle="Agrega un nuevo contacto para tus transferencias"
      icon="person_add">
    </app-page-header>

    <mat-card class="beneficiary-card">
      <mat-card-content>
        <form [formGroup]="beneficiaryForm" (ngSubmit)="onSubmit()" novalidate>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="nombre" autocomplete="given-name">
              <mat-icon matPrefix>person</mat-icon>
              @if (beneficiaryForm.get('nombre')?.hasError('required') && beneficiaryForm.get('nombre')?.touched) {
                <mat-error>Nombre es obligatorio</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Apellido</mat-label>
              <input matInput formControlName="apellido" autocomplete="family-name">
              @if (beneficiaryForm.get('apellido')?.hasError('required') && beneficiaryForm.get('apellido')?.touched) {
                <mat-error>Apellido es obligatorio</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>RUT Destinatario</mat-label>
              <input matInput formControlName="rut_destinatario" placeholder="12.345.678-9">
              <mat-icon matPrefix>badge</mat-icon>
              @if (beneficiaryForm.get('rut_destinatario')?.hasError('required') && beneficiaryForm.get('rut_destinatario')?.touched) {
                <mat-error>RUT es obligatorio</mat-error>
              }
              @if (beneficiaryForm.get('rut_destinatario')?.hasError('invalidRut')) {
                <mat-error>RUT invalido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Correo electronico</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              <mat-icon matPrefix>email</mat-icon>
              @if (beneficiaryForm.get('email')?.hasError('email')) {
                <mat-error>Correo invalido</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Telefono</mat-label>
            <input matInput formControlName="telefono" type="tel" autocomplete="tel">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Banco</mat-label>
              <mat-select formControlName="banco">
                @for (bank of bankService.banks(); track bank.id) {
                  <mat-option [value]="bank.name">{{ bank.name }}</mat-option>
                }
              </mat-select>
              @if (beneficiaryForm.get('banco')?.hasError('required') && beneficiaryForm.get('banco')?.touched) {
                <mat-error>Seleccione un banco</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Cuenta</mat-label>
              <mat-select formControlName="tipo_cuenta">
                <mat-option value="Cuenta Corriente">Cuenta Corriente</mat-option>
                <mat-option value="Cuenta Vista">Cuenta Vista</mat-option>
                <mat-option value="Cuenta de Ahorro">Cuenta de Ahorro</mat-option>
                <mat-option value="Cuenta RUT">Cuenta RUT</mat-option>
              </mat-select>
              @if (beneficiaryForm.get('tipo_cuenta')?.hasError('required') && beneficiaryForm.get('tipo_cuenta')?.touched) {
                <mat-error>Seleccione tipo de cuenta</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Numero de Cuenta</mat-label>
            <input matInput formControlName="numero_cuenta">
            <mat-icon matPrefix>credit_card</mat-icon>
            @if (beneficiaryForm.get('numero_cuenta')?.hasError('required') && beneficiaryForm.get('numero_cuenta')?.touched) {
              <mat-error>Numero de cuenta es obligatorio</mat-error>
            }
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="beneficiaryForm.reset()">
              Limpiar
            </button>
            <button mat-flat-button
                    color="primary"
                    type="submit"
                    [disabled]="beneficiaryForm.invalid || isSubmitting()"
                    class="submit-btn">
              <mat-icon>save</mat-icon>
              Guardar Destinatario
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .beneficiary-card {
      max-width: 720px;
      border-radius: 0.5rem !important;
    }

    .full-width { width: 100%; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .submit-btn {
      height: 48px;
      padding: 0 32px;
      border-radius: 5rem !important;
    }

    .submit-btn mat-icon { margin-right: 8px; }
  `]
})
export class NewBeneficiaryComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly transferService = inject(TransferService);
  readonly bankService = inject(BankService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly isSubmitting = signal(false);

  readonly beneficiaryForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    rut_destinatario: ['', [Validators.required, rutValidator()]],
    email: ['', [Validators.email]],
    telefono: [''],
    banco: ['', Validators.required],
    tipo_cuenta: ['', Validators.required],
    numero_cuenta: ['', Validators.required]
  });

  ngOnInit(): void {
    this.bankService.loadBanks().subscribe();
  }

  async onSubmit(): Promise<void> {
    if (this.beneficiaryForm.invalid) {
      this.beneficiaryForm.markAllAsTouched();
      return;
    }

    const values = this.beneficiaryForm.getRawValue();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Registro',
        message: `Registrar a ${values.nombre} ${values.apellido} como destinatario?`,
        confirmText: 'Registrar',
        type: 'info'
      },
      width: '400px'
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    this.isSubmitting.set(true);
    const success = await this.transferService.registerBeneficiary(
      this.auth.userRut(),
      values
    );
    this.isSubmitting.set(false);

    if (success) {
      this.snackBar.open('Destinatario registrado con exito', 'Cerrar', {
        duration: 4000,
        panelClass: 'success-snackbar'
      });
      this.router.navigate(['/transfers/new']);
    } else {
      this.snackBar.open('Error al registrar destinatario', 'Cerrar', {
        duration: 4000,
        panelClass: 'error-snackbar'
      });
    }
  }
}
