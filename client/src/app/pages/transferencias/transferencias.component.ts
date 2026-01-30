import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ComunicationService } from '../../services/comunication-services.service';
import { LoadingService } from '../../shared/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Componente para realizar transferencias a destinatarios registrados
 * Migrado a Material Design con estado vacío y confirmación elegante
 */
@Component({
    selector: 'app-transferencias',
    templateUrl: './transferencias.component.html',
    styleUrls: ['./transferencias.component.scss'],
    standalone: false
})
export class TransferenciasComponent implements OnInit {
  filteredOptions!: Observable<any[]>;
  busquedaResultados: any[] = [];
  busquedaControl: FormControl = new FormControl();
  datosTransferencia!: FormGroup;
  resultados: any[] = [];
  rut!: any;

  constructor(
    private _cs: ComunicationService,
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.init();
    this.crearFormulario();
    this.obtenerDatos();
    this.setupAutoComplete();
  }

  // ============================================================================
  // GETTERS
  // ============================================================================
  get montoNoValido(): boolean {
    return (
      this.datosTransferencia.get('monto')!.invalid &&
      this.datosTransferencia.get('monto')!.touched &&
      Number(this.datosTransferencia.get('monto')!.value) !== 0
    );
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Inicializa el RUT del usuario desde localStorage
   */
  private init(): void {
    const login = JSON.parse(localStorage.getItem('login') || '{}');

    if (Object.keys(login).length > 0) {
      this.rut = login.usuario.rut;
    }
  }

  /**
   * Crea el formulario reactivo
   */
  private crearFormulario(): void {
    this.datosTransferencia = this.fb.group({
      nombre: ['', [Validators.required]],
      rut_destinatario: ['', [Validators.required]],
      email: ['', [Validators.required]],
      tipo_cuenta: ['', [Validators.required]],
      banco: ['', [Validators.required]],
      cuenta: ['', [Validators.required]],
      monto: ['', [Validators.required, Validators.min(1)]],
    });
  }

  /**
   * Configura el autocomplete para búsqueda de destinatarios
   */
  private setupAutoComplete(): void {
    this.filteredOptions = this.busquedaControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filtro(value || ''))
    );
  }

  /**
   * Filtra los destinatarios según el valor ingresado
   */
  private _filtro(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.busquedaResultados.filter((option) =>
      option.nombre.toLowerCase().includes(filterValue)
    );
  }

  /**
   * Marca todos los campos como touched para mostrar errores
   */
  private marcarCamposComoTocados(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup) {
        this.marcarCamposComoTocados(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Obtiene la lista de destinatarios del usuario
   */
  public async obtenerDatos(): Promise<void> {
    this.loadingService.show('Cargando destinatarios...');

    this._cs.buscarDestinatarios(this.rut).subscribe({
      next: (response: HttpResponse<any>) => {
        this.loadingService.hide();
        this.busquedaResultados = response.body.destinatarios || [];

        if (this.busquedaResultados.length === 0) {
          console.log('No hay destinatarios registrados');
        }
      },
      error: (error: any) => {
        this.loadingService.hide();
        this.busquedaResultados = [];
        console.error('Error al cargar destinatarios:', error);
      }
    });
  }

  /**
   * Maneja la selección de un destinatario del autocomplete
   */
  public selectedOne($event: any): void {
    const input = $event.target.value.toLowerCase();

    this.resultados = this.busquedaResultados.filter((option) =>
      option.nombre.toLowerCase().includes(input)
    );

    if (this.resultados.length > 0) {
      this.datosTransferencia.patchValue({
        rut_destinatario: this.resultados[0].rut_destinatario,
        nombre: this.resultados[0].nombre,
        email: this.resultados[0].email,
        banco: this.resultados[0].banco,
        tipo_cuenta: this.resultados[0].tipo_cuenta,
        cuenta: this.resultados[0].numero_cuenta,
      });
    }
  }

  /**
   * Limpia el formulario
   */
  public limpiarFormulario(): void {
    this.datosTransferencia.reset();
    this.busquedaControl.setValue('');
  }

  /**
   * Envía la transferencia (corregido typo: realizo → realizó)
   */
  public enviarTransferencia(): void {
    if (this.datosTransferencia.invalid) {
      this.marcarCamposComoTocados(this.datosTransferencia);
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Diálogo de confirmación
    const monto = this.datosTransferencia.get('monto')!.value;
    const destinatario = this.datosTransferencia.get('nombre')!.value;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Transferencia',
        message: `¿Deseas transferir $${monto.toLocaleString('es-CL')} CLP a ${destinatario}?`,
        confirmText: 'Sí, transferir',
        cancelText: 'Cancelar',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      this.loadingService.show('Procesando transferencia...');

      try {
        const login = JSON.parse(localStorage.getItem('login') || '{}');

        if (Object.keys(login).length === 0) {
          this.loadingService.hide();
          this.snackBar.open('Sesión expirada. Por favor inicia sesión nuevamente.', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['/inicio']);
          return;
        }

        const response = await this._cs.guardarTransferencia(
          login.usuario.rut,
          this.datosTransferencia.value
        );

        this.loadingService.hide();

        if (response.ok) {
          // Typo corregido: "Se realizó transferencia" (no "realizo")
          this.snackBar.open(
            `Se realizó la transferencia de $${monto.toLocaleString('es-CL')} CLP exitosamente`,
            'Ver Historial',
            {
              duration: 5000,
              panelClass: ['success-snackbar']
            }
          ).onAction().subscribe(() => {
            this.router.navigate(['/historial']);
          });

          this.limpiarFormulario();
        } else {
          this.snackBar.open('Error al procesar la transferencia. Intenta nuevamente.', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.loadingService.hide();
        this.snackBar.open('Error al procesar la transferencia. Intenta nuevamente.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        console.error('Error en enviarTransferencia:', error);
      }
    });
  }
}
