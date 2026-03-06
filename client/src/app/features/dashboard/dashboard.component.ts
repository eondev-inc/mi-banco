import { Component, inject, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { TransferService } from '../../core/services/transfer.service';
import { Transfer } from '../../core/models/user.model';
import { SummaryCardComponent } from '../../shared/components/summary-card/summary-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CurrencyClpPipe } from '../../shared/pipes/currency-clp.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    DatePipe,
    SummaryCardComponent,
    PageHeaderComponent,
    CurrencyClpPipe
  ],
  template: `
    <app-page-header
      title="Bienvenido, {{ auth.userName() }}"
      subtitle="Resumen de tu cuenta al dia de hoy"
      icon="dashboard">
    </app-page-header>

    <!-- Summary Cards Grid -->
    <div class="summary-grid">
      <app-summary-card
        label="Saldo Disponible"
        [value]="formattedBalance()"
        icon="account_balance_wallet"
        color="primary"
        subtitle="Cuenta principal">
      </app-summary-card>

      <app-summary-card
        label="Egresos del Mes"
        [value]="formattedExpenses()"
        icon="trending_down"
        color="warning"
        [subtitle]="transferService.accountSummary().transferenciasRecientes + ' transferencias'">
      </app-summary-card>

      <app-summary-card
        label="Transferencias"
        [value]="'' + transferService.accountSummary().transferenciasRecientes"
        icon="swap_horiz"
        color="accent"
        subtitle="Total realizadas">
      </app-summary-card>

      <app-summary-card
        label="Estado"
        value="Activa"
        icon="verified"
        color="success"
        subtitle="Cuenta verificada">
      </app-summary-card>
    </div>

    <!-- Recent Transactions -->
    <mat-card class="recent-transactions-card">
      <mat-card-header>
        <mat-card-title>Ultimos Movimientos</mat-card-title>
        <a mat-button color="primary" routerLink="/history" class="view-all-link">
          Ver todos
          <mat-icon>arrow_forward</mat-icon>
        </a>
      </mat-card-header>

      <mat-card-content>
        @if (recentTransfers().length === 0) {
          <div class="empty-state">
            <mat-icon class="empty-state__icon">receipt_long</mat-icon>
            <p class="empty-state__text">No tienes movimientos recientes</p>
            <button mat-flat-button color="primary" routerLink="/transfers/new">
              Realizar tu primera transferencia
            </button>
          </div>
        } @else {
          <mat-list>
            @for (tx of recentTransfers(); track $index) {
              <mat-list-item class="transaction-item">
                <mat-icon matListItemIcon class="transaction-icon">
                  {{ tx.monto > 0 ? 'arrow_upward' : 'arrow_downward' }}
                </mat-icon>
                <div matListItemTitle class="transaction-title">
                  {{ tx.nombre }}
                </div>
                <div matListItemLine class="transaction-meta">
                  {{ tx.banco }} &middot; {{ tx.fecha | date:'dd/MM/yyyy' }}
                </div>
                <span class="transaction-amount" [class.negative]="true">
                  {{ tx.monto | currencyClp }}
                </span>
              </mat-list-item>
              <mat-divider></mat-divider>
            }
          </mat-list>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .recent-transactions-card {
      border-radius: 0.5rem !important;
      margin-bottom: 32px;
    }

    .recent-transactions-card mat-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .view-all-link {
      margin-left: auto;
    }

    .transaction-item {
      height: auto !important;
      padding: 16px 0 !important;
    }

    .transaction-icon {
      color: #FB8C00;
    }

    .transaction-title {
      font-weight: 500;
    }

    .transaction-meta {
      font-size: 0.8125rem;
      color: #757575;
    }

    .transaction-amount {
      font-weight: 700;
      font-size: 0.9375rem;
      margin-left: auto;
    }

    .transaction-amount.negative { color: #DC3545; }
    .transaction-amount.positive { color: #43A047; }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-state__icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #C4C4C4;
    }

    .empty-state__text {
      color: #757575;
      margin: 16px 0 24px;
    }

    @media (max-width: 600px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly transferService = inject(TransferService);

  readonly recentTransfers = computed<Transfer[]>(() =>
    this.transferService.transfers().slice(0, 5)
  );

  readonly formattedBalance = computed(() => {
    const balance = this.transferService.accountSummary().saldo;
    return '$' + Math.round(balance).toLocaleString('es-CL');
  });

  readonly formattedExpenses = computed(() => {
    const expenses = this.transferService.accountSummary().egresos;
    return '$' + Math.round(expenses).toLocaleString('es-CL');
  });

  ngOnInit(): void {
    const rut = this.auth.userRut();
    if (rut) {
      this.transferService.loadTransfers(rut).subscribe();
    }
  }
}
