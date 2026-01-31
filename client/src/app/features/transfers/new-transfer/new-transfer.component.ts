import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/auth/auth.service';
import { TransferService } from '../../../core/services/transfer.service';
import { BankService } from '../../../core/services/bank.service';
import { Beneficiary } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CurrencyClpPipe } from '../../../shared/pipes/currency-clp.pipe';
import { rutValidator } from '../../../shared/validators/rut.validator';

@Component({
  selector: 'app-new-transfer',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatDividerModule,
    PageHeaderComponent,
    CurrencyClpPipe
  ],
  template: `
    <app-page-header
      title="Nueva Transferencia"
      subtitle="Envia dinero a tus destinatarios registrados"
      icon="send">
    </app-page-header>

    <mat-card class="transfer-card">
      <mat-card-content>
        <form [formGroup]="transferForm" (ngSubmit)="onSubmit()" novalidate>

          <!-- Beneficiary selection -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Destinatario</mat-label>
            <input matInput
                   formControlName="nombre"
                   [matAutocomplete]="autoComplete"
                   placeholder="Buscar destinatario..."
                   aria-label="Buscar destinatario">
            <mat-icon matPrefix>person_search</mat-icon>
            <mat-autocomplete #autoComplete="matAutocomplete"
                              (optionSelected)="onBeneficiarySelected($event.option.value)">
              @for (b of filteredBeneficiaries(); track b.rut_destinatario) {
                <mat-option [value]="b">
                  <span class="autocomplete-option">
                    <strong>{{ b.nombre }} {{ b.apellido }}</strong>
                    <span class="autocomplete-meta">{{ b.banco }} &middot; {{ b.tipo_cuenta }}</span>
                  </span>
                </mat-option>
              }
            </mat-autocomplete>
            @if (transferForm.get('nombre')?.hasError('required') && transferForm.get('nombre')?.touched) {
              <mat-error>Seleccione un destinatario</mat-error>
            }
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>RUT Destinatario</mat-label>
              <input matInput formControlName="rut_destinatario" readonly>
              <mat-icon matPrefix>badge</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Banco</mat-label>
              <input matInput formControlName="banco" readonly>
              <mat-icon matPrefix>account_balance</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tipo de Cuenta</mat-label>
            <input matInput formControlName="tipo_cuenta" readonly>
          </mat-form-field>

          <mat-divider class="form-divider"></mat-divider>

          <!-- Amount -->
          <mat-form-field appearance="outline" class="full-width amount-field">
            <mat-label>Monto a transferir</mat-label>
            <span matPrefix class="currency-prefix">$&nbsp;</span>
            <input matInput
                   type="number"
                   formControlName="monto"
                   min="1"
                   aria-label="Monto a transferir">
            @if (transferForm.get('monto')?.hasError('required') && transferForm.get('monto')?.touched) {
              <mat-error>El monto es obligatorio</mat-error>
            }
            @if (transferForm.get('monto')?.hasError('min')) {
              <mat-error>El monto debe ser mayor a $0</mat-error>
            }
            <mat-hint>Saldo disponible: {{ availableBalance() | currencyClp }}</mat-hint>
          </mat-form-field>

          <div class="form-actions">
            <button mat-flat-button
                    color="primary"
                    type="submit"
                    [disabled]="transferForm.invalid || isSubmitting()"
                    class="submit-btn">
              <mat-icon>send</mat-icon>
              Transferir
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .transfer-card {
      max-width: 640px;
      border-radius: 16px !important;
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

    .form-divider {
      margin: 16px 0 24px;
    }

    .amount-field input {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .currency-prefix {
      font-size: 1.25rem;
      font-weight: 500;
      color: #757575;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .submit-btn {
      height: 48px;
      padding: 0 32px;
      font-size: 1rem;
      border-radius: 12px !important;
    }

    .submit-btn mat-icon { margin-right: 8px; }

    .autocomplete-option {
      display: flex;
      flex-direction: column;
      line-height: 1.4;
    }

    .autocomplete-meta {
      font-size: 0.75rem;
      color: #757575;
    }
  `]
})
export class NewTransferComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly transferService = inject(TransferService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly isSubmitting = signal(false);

  readonly availableBalance = computed(() =>
    this.transferService.accountSummary().saldo
  );

  readonly filteredBeneficiaries = computed(() => {
    const searchTerm = (this.transferForm.get('nombre')?.value ?? '').toLowerCase();
    if (typeof searchTerm !== 'string') return this.transferService.beneficiaries();
    return this.transferService.beneficiaries().filter(b =>
      `${b.nombre} ${b.apellido}`.toLowerCase().includes(searchTerm)
    );
  });

  readonly transferForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    rut_destinatario: ['', Validators.required],
    banco: ['', Validators.required],
    tipo_cuenta: ['', Validators.required],
    monto: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    const rut = this.auth.userRut();
    if (rut) {
      this.transferService.loadBeneficiaries(rut).subscribe();
      this.transferService.loadTransfers(rut).subscribe();
    }
  }

  onBeneficiarySelected(b: Beneficiary): void {
    this.transferForm.patchValue({
      nombre: `${b.nombre} ${b.apellido}`,
      rut_destinatario: b.rut_destinatario,
      banco: b.banco,
      tipo_cuenta: b.tipo_cuenta
    });
  }

  async onSubmit(): Promise<void> {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const values = this.transferForm.getRawValue();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Transferencia',
        message: `Vas a transferir $${values.monto.toLocaleString('es-CL')} a ${values.nombre}. Esta accion no se puede deshacer.`,
        confirmText: 'Transferir',
        type: 'warning'
      },
      width: '400px'
    });

    const confirmed = await dialogRef.afterClosed().toPromise();
    if (!confirmed) return;

    this.isSubmitting.set(true);
    const success = await this.transferService.createTransfer(
      this.auth.userRut(),
      values
    );
    this.isSubmitting.set(false);

    if (success) {
      this.snackBar.open('Transferencia realizada con exito', 'Cerrar', {
        duration: 4000,
        panelClass: 'success-snackbar'
      });
      this.transferForm.reset();
      this.transferService.loadTransfers(this.auth.userRut()).subscribe();
    } else {
      this.snackBar.open('Error al realizar la transferencia', 'Cerrar', {
        duration: 4000,
        panelClass: 'error-snackbar'
      });
    }
  }
}
