import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { validate, clean, format } from 'rut.js';
import { ListaBancos } from 'src/app/interfaces/bank-list.interface';
import { ComunicationService } from 'src/app/services/comunication-services.service';
import { LoadingService } from '../../shared/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Componente para registrar nuevos destinatarios/beneficiarios
 * Migrado a Material Design con grid responsive y mat-select con íconos
 */
@Component({
    selector: 'app-registrar',
    templateUrl: './registrar.component.html',
    styleUrls: ['./registrar.component.scss'],
    standalone: false
})
export class RegistrarComponent implements OnInit {
  public datosTransferencia!: FormGroup;
  public bancos!: ListaBancos;

  // RUTs no válidos (secuencias repetitivas)
  private noValidos: string[] = [
    '19',
    '1111111', '2222222', '3333333', '4444444', '5555555',
    '6666666', '7777777', '8888888', '9999999', '1234567',
    '7654321', '11111111', '22222222', '33333333', '44444444',
    '55555555', '66666666', '77777777', '88888888', '99999999',
    '12345678', '87654321',
  ];

  // RegExp para validar correos
  private emailPattern =
    '^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _cs: ComunicationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.getBankList();
  }

  // ============================================================================
  // GETTERS PARA VALIDACIÓN
  // ============================================================================
  get nombreNoValido(): boolean {
    return this.datosTransferencia.get('nombre')!.invalid && this.datosTransferencia.get('nombre')!.touched;
  }

  get apellidoNoValido(): boolean {
    return this.datosTransferencia.get('apellido')!.invalid && this.datosTransferencia.get('apellido')!.touched;
  }

  get emailNoValido(): boolean {
    return this.datosTransferencia.get('email')!.invalid && this.datosTransferencia.get('email')!.touched;
  }

  get rutNoValido(): boolean {
    return this.datosTransferencia.get('rut')!.invalid && this.datosTransferencia.get('rut')!.touched;
  }

  get telefonoNoValido(): boolean {
    return this.datosTransferencia.get('telefono')!.invalid && this.datosTransferencia.get('telefono')!.touched;
  }

  get cuentanoValido(): boolean {
    return this.datosTransferencia.get('cuenta')!.invalid && this.datosTransferencia.get('cuenta')!.touched;
  }

  get tipoCuentanoValido(): boolean {
    return this.datosTransferencia.get('tipo_cuenta')!.invalid && this.datosTransferencia.get('tipo_cuenta')!.touched;
  }

  get rut(): FormControl {
    return this.datosTransferencia.get('rut') as FormControl;
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  /**
   * Obtiene el listado de bancos desde la API o localStorage
   */
  private async getBankList(): Promise<void> {
    const bancosStorage = JSON.parse(localStorage.getItem('bancos') || '{}');

    if (Object.keys(bancosStorage).length > 0) {
      this.bancos = bancosStorage;
    } else {
      this._cs.getBankList().subscribe({
        next: (response: ListaBancos) => {
          if (response) {
            this.bancos = response;
            localStorage.setItem('bancos', JSON.stringify(this.bancos));
          }
        },
        error: (error: any) => {
          this.snackBar.open('Error al cargar lista de bancos', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          console.error('Error getBankList:', error);
        }
      });
    }
  }

  /**
   * Crea el formulario reactivo con validaciones
   */
  private crearFormulario(): void {
    this.datosTransferencia = this.fb.group({
      nombre: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZzñÑáéíóúÁÉÍÓÚ ]+$')],
      ],
      apellido: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZzñÑáéíóúÁÉÍÓÚ ]+$')],
      ],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      rut: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      cuenta: ['', [Validators.required]],
      tipo_cuenta: ['', [Validators.required]],
      banco: ['', [Validators.required]],
    });
  }

  /**
   * Marca todos los campos del formulario como touched para mostrar errores
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
   * Verifica y formatea el RUT del destinatario
   */
  public verificarRut(e: any): void {
    const value = e.target.value;
    const esRutNoValido: boolean = this.noValidos.includes(value);

    // Verificar rango
    const esMayor: boolean = parseInt(value) > 1000000;
    const esMenor: boolean = parseInt(value) < 50000000;

    if (!esRutNoValido && esMenor && esMayor) {
      const cleanValue: string = clean(value);
      const esValido: boolean = validate(cleanValue);
      const formateado: string = format(cleanValue);

      if (!esValido) {
        this.rut.setErrors({ rutNoValido: true });
        this.rut.markAsDirty();
      } else {
        this.rut.setErrors(null);
        this.rut.setValue(formateado, { emitEvent: false });
      }
    } else {
      this.rut.setErrors({ rutNoValido: true });
      this.rut.markAsDirty();
    }
  }

  /**
   * Envía el formulario para guardar el nuevo destinatario
   */
  public async enviarFormulario(): Promise<void> {
    if (this.datosTransferencia.invalid) {
      this.marcarCamposComoTocados(this.datosTransferencia);
      return;
    }

    // Diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Registro',
        message: '¿Deseas guardar este destinatario?',
        confirmText: 'Sí, guardar',
        cancelText: 'Cancelar',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      this.loadingService.show('Guardando destinatario...');

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

        const response = await this._cs.guardarFormulario(login.usuario.rut, this.datosTransferencia.value);

        this.loadingService.hide();

        if (response.ok) {
          this.snackBar.open('Destinatario registrado exitosamente', 'Ver Transferencias', {
            duration: 5000,
            panelClass: ['success-snackbar']
          }).onAction().subscribe(() => {
            this.router.navigate(['/transferencias']);
          });

          this.datosTransferencia.reset();
        } else {
          this.snackBar.open('Error al guardar el destinatario. Intenta nuevamente.', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.loadingService.hide();
        this.snackBar.open('Error al guardar el destinatario. Intenta nuevamente.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        console.error('Error en enviarFormulario:', error);
      }
    });
  }
}
