import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ListaHistorial } from 'src/app/interfaces/history.interface';
import { ComunicationService } from 'src/app/services/comunication-services.service';
import { LoadingService } from '../../shared/services/loading.service';

/**
 * Componente de Historial de Transferencias
 * Migrado a MatTable con paginación, ordenamiento y búsqueda integrada
 */
@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnInit {
  public historial!: ListaHistorial;
  public dataSource!: MatTableDataSource<any>;
  public searchText: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Columnas a mostrar en la tabla
  displayedColumns: string[] = ['index', 'nombre', 'fecha', 'banco', 'monto', 'tipo_cuenta'];

  constructor(
    private _cs: ComunicationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.initHistorial();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Inicializa el historial cargando datos del usuario
   */
  private initHistorial(): void {
    const login = JSON.parse(localStorage.getItem('login') || '{}');

    if (Object.keys(login).length > 0) {
      this.cargarHistorial(login.usuario.rut);
    } else {
      this.snackBar.open('Sesión expirada. Por favor inicia sesión.', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.router.navigate(['/inicio']);
    }
  }

  /**
   * Carga el historial de transferencias del usuario
   */
  private async cargarHistorial(rut: string): Promise<void> {
    this.loadingService.show('Cargando historial...');

    this._cs.obtenerHistorial(rut).subscribe({
      next: (response: HttpResponse<ListaHistorial>) => {
        this.loadingService.hide();

        if (response.body) {
          this.historial = response.body;

          // Configurar MatTableDataSource
          this.dataSource = new MatTableDataSource(this.historial.historial);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          // Configurar filtro personalizado
          this.dataSource.filterPredicate = (data: any, filter: string) => {
            const searchStr = filter.toLowerCase();
            return (
              data.nombre.toLowerCase().includes(searchStr) ||
              data.banco.toLowerCase().includes(searchStr) ||
              data.monto.toString().includes(searchStr) ||
              (data.tipo_cuenta && data.tipo_cuenta.toLowerCase().includes(searchStr))
            );
          };
        }
      },
      error: (error: any) => {
        this.loadingService.hide();
        console.error('Error al cargar historial:', error);

        // No mostrar error si simplemente no hay transferencias
        if (error.status === 404 || error.status === 204) {
          this.historial = { historial: [] } as ListaHistorial;
        } else {
          this.snackBar.open('Error al cargar el historial', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      }
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Aplica el filtro de búsqueda a la tabla
   */
  public applyFilter(): void {
    if (this.dataSource) {
      this.dataSource.filter = this.searchText.trim().toLowerCase();

      // Volver a la primera página después de filtrar
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  /**
   * Limpia el filtro de búsqueda
   */
  public clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }
}
