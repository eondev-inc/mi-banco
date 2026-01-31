import { Component, inject, OnInit, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { TransferService } from '../../core/services/transfer.service';
import { Transfer } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CurrencyClpPipe } from '../../shared/pipes/currency-clp.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    DatePipe,
    PageHeaderComponent,
    CurrencyClpPipe
  ],
  template: `
    <app-page-header
      title="Historial de Transacciones"
      subtitle="Revisa todos tus movimientos realizados"
      icon="history">
    </app-page-header>

    <mat-card class="history-card">
      <!-- Search / Filter Bar -->
      <div class="filter-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar transaccion</mat-label>
          <input matInput
                 [formControl]="searchControl"
                 placeholder="Nombre, banco, monto..."
                 aria-label="Buscar transaccion">
          <mat-icon matPrefix>search</mat-icon>
          @if (searchControl.value) {
            <button mat-icon-button matSuffix (click)="clearSearch()" aria-label="Limpiar busqueda">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <span class="filter-count">
          {{ dataSource.filteredData.length }} transacciones
        </span>
      </div>

      <!-- Loading State -->
      @if (transferService.isLoading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando historial...</p>
        </div>
      } @else if (dataSource.data.length === 0) {
        <!-- Empty State -->
        <div class="empty-state">
          <mat-icon class="empty-state__icon">receipt_long</mat-icon>
          <h3>Sin movimientos</h3>
          <p>Aun no has realizado ninguna transferencia</p>
        </div>
      } @else {
        <!-- Data Table -->
        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="history-table">
            <!-- Index Column -->
            <ng-container matColumnDef="index">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>#</th>
              <td mat-cell *matCellDef="let i = index">{{ i + 1 }}</td>
            </ng-container>

            <!-- Nombre Column -->
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Destinatario</th>
              <td mat-cell *matCellDef="let tx">
                <div class="cell-primary">{{ tx.nombre }}</div>
              </td>
            </ng-container>

            <!-- Fecha Column -->
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha</th>
              <td mat-cell *matCellDef="let tx">{{ tx.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
            </ng-container>

            <!-- Banco Column -->
            <ng-container matColumnDef="banco">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Banco</th>
              <td mat-cell *matCellDef="let tx">{{ tx.banco }}</td>
            </ng-container>

            <!-- Tipo Cuenta Column -->
            <ng-container matColumnDef="tipo_cuenta">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
              <td mat-cell *matCellDef="let tx">
                <mat-chip class="chip-type">{{ tx.tipo_cuenta }}</mat-chip>
              </td>
            </ng-container>

            <!-- Monto Column -->
            <ng-container matColumnDef="monto">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Monto</th>
              <td mat-cell *matCellDef="let tx" class="cell-amount">
                {{ tx.monto | currencyClp }}
              </td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let tx">
                <mat-chip [class]="'chip-' + (tx.estado ?? 'completada')">
                  {{ tx.estado ?? 'Completada' }}
                </mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                       showFirstLastButtons
                       aria-label="Seleccionar pagina">
        </mat-paginator>
      }
    </mat-card>
  `,
  styles: [`
    .history-card {
      border-radius: 0.5rem !important;
      overflow: hidden;
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 16px 0;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 280px;
    }

    .filter-count {
      font-size: 0.875rem;
      color: #757575;
      white-space: nowrap;
    }

    .table-container {
      overflow-x: auto;
    }

    .history-table {
      width: 100%;
    }

    .cell-primary {
      font-weight: 500;
    }

    .cell-amount {
      font-weight: 700;
      color: #DC3545;
      white-space: nowrap;
    }

    .chip-type {
      --mat-chip-elevated-container-color: #CFF4FC;
      --mat-chip-label-text-color: #0AA2C0;
      font-size: 0.75rem;
    }

    .chip-completada {
      --mat-chip-elevated-container-color: #E0FAED;
      --mat-chip-label-text-color: #2E8B57;
    }

    .chip-pendiente {
      --mat-chip-elevated-container-color: #FFF3E0;
      --mat-chip-label-text-color: #E56B00;
    }

    .chip-rechazada {
      --mat-chip-elevated-container-color: #FBE7E9;
      --mat-chip-label-text-color: #B72C39;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 64px 24px;
      color: #757575;
    }

    .empty-state__icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #C4C4C4;
    }

    .empty-state h3 {
      margin: 16px 0 8px;
      font-size: 1.25rem;
      color: #424242;
    }
  `]
})
export class HistoryComponent implements OnInit, AfterViewInit {
  private readonly auth = inject(AuthService);
  readonly transferService = inject(TransferService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly searchControl = new FormControl('');
  readonly dataSource = new MatTableDataSource<Transfer>([]);

  readonly displayedColumns = [
    'index', 'nombre', 'fecha', 'banco', 'tipo_cuenta', 'monto', 'estado'
  ];

  ngOnInit(): void {
    const rut = this.auth.userRut();
    if (rut) {
      this.transferService.loadTransfers(rut).subscribe(transfers => {
        this.dataSource.data = transfers;
      });
    }

    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = (value ?? '').trim().toLowerCase();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
