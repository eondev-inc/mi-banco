import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
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
    MatChipsModule,
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

    <!-- Quick Actions -->
    <mat-card class="quick-actions-card">
      <mat-card-header>
        <mat-card-title>Acciones Rapidas</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="quick-actions">
          <button mat-stroked-button routerLink="/transfers/new" class="quick-action-btn">
            <mat-icon>send</mat-icon>
            <span>Transferir</span>
          </button>
          <button mat-stroked-button routerLink="/transfers/beneficiary" class="quick-action-btn">
            <mat-icon>person_add</mat-icon>
            <span>Nuevo Destinatario</span>
          </button>
          <button mat-stroked-button routerLink="/history" class="quick-action-btn">
            <mat-icon>receipt_long</mat-icon>
            <span>Ver Historial</span>
          </button>
          <button mat-stroked-button routerLink="/profile" class="quick-action-btn">
            <mat-icon>settings</mat-icon>
            <span>Mi Perfil</span>
          </button>
        </div>
      </mat-card-content>
    </mat-card>

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
      gap: 20px;
      margin-bottom: 24px;
    }

    .quick-actions-card,
    .recent-transactions-card {
      border-radius: 16px !important;
      margin-bottom: 24px;
    }

    .quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px 0;
    }

    .quick-action-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px 24px;
      border-radius: 16px !important;
      min-width: 120px;
      font-size: 0.8125rem;
    }

    .quick-action-btn mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: var(--mb-primary, #1976D2);
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
      padding: 12px 0 !important;
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

    .transaction-amount.negative { color: #D32F2F; }
    .transaction-amount.positive { color: #43A047; }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
    }

    .empty-state__icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #BDBDBD;
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

      .quick-actions {
        flex-direction: column;
      }

      .quick-action-btn {
        flex-direction: row;
        justify-content: flex-start;
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
