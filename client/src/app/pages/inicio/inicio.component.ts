import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { validate, clean, format } from 'rut.js';
import { ComunicationService } from '../../services/comunication-services.service';
import { LoadingService } from '../../shared/services/loading.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

/**
 * Componente de Inicio - Login y Registro con Material Design
 * Reemplaza Bootstrap + SweetAlert por Material nativo
 */
@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.component.html',
    styleUrls: ['./inicio.component.scss'],
    standalone: false
})
export class InicioComponent implements OnInit {
  public datosLogin!: FormGroup;
  public datosRegistro!: FormGroup;
  public alreadyLogged: boolean = false;
  public sesion: any;
  public selectedTabIndex: number = 0;
  public hidePasswordLogin: boolean = true;
  public hidePasswordRegistro: boolean = true;

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
  private emailPattern: string =
    '^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$';

  constructor(
    private fb: FormBuilder,
    private _cs: ComunicationService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.crearFormularios();
    this.chequearSesion();
  }

  // ============================================================================
  // GETTERS PARA VALIDACIÓN
  // ============================================================================
  get nombreNoValido(): boolean {
    return this.datosRegistro.get('nombre')!.invalid && this.datosRegistro.get('nombre')!.touched;
  }

  get emailNoValido(): boolean {
    return this.datosRegistro.get('email')!.invalid && this.datosRegistro.get('email')!.touched;
  }

  get passwordNoValidoLogin(): boolean {
    return this.datosLogin.get('password')!.invalid && this.datosLogin.get('password')!.touched;
  }

  get rutNoValido(): boolean {
    return this.datosRegistro.get('rut')!.invalid && this.datosRegistro.get('rut')!.touched;
  }

  get passwordNoValidoRegistro(): boolean {
    return this.datosRegistro.get('password')!.invalid && this.datosRegistro.get('password')!.touched;
  }

  get rutLogin(): FormControl {
    return this.datosLogin.get('rut') as FormControl;
  }

  get rutNoValidoLogin(): boolean {
    return this.datosLogin.get('rut')!.invalid && this.datosLogin.get('rut')!.touched;
  }

  get rut(): FormControl {
    return this.datosRegistro.get('rut') as FormControl;
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================
  private chequearSesion(): void {
    this.sesion = JSON.parse(localStorage.getItem('login') || '{}');

    if (this.sesion && Object.keys(this.sesion).length > 0) {
      this.alreadyLogged = true;
    }
  }

  private crearFormularios(): void {
    this.datosLogin = this.fb.group({
      rut: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.datosRegistro = this.fb.group({
      nombre: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZzñÑáéíóúÁÉÍÓÚ ]+$')],
      ],
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      rut: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

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
   * Verifica y formatea el RUT ingresado
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
        this.rutLogin.setErrors({ rutNoValido: true });
        this.rutLogin.markAsDirty();
        this.rut.setErrors({ rutNoValido: true });
        this.rut.markAsDirty();
      } else {
        this.rutLogin.setErrors(null);
        this.rutLogin.setValue(formateado, { emitEvent: false });
        this.rut.setErrors(null);
        this.rut.setValue(formateado, { emitEvent: false });
      }
    } else {
      this.rut.setErrors({ rutNoValido: true });
      this.rut.markAsDirty();
      this.rutLogin.setErrors({ rutNoValido: true });
      this.rutLogin.markAsDirty();
    }
  }

  /**
   * Submit del formulario de login
   */
  public async submitLogin(): Promise<void> {
    if (this.datosLogin.invalid) {
      this.marcarCamposComoTocados(this.datosLogin);
      return;
    }

    this.loadingService.show('Iniciando sesión...');

    this._cs.usuarioLogin(this.datosLogin.value).subscribe({
      next: (response: HttpResponse<any>) => {
        this.loadingService.hide();

        if (response.ok && response.body) {
          const data = response.body;
          // Guardar datos de sesión
          localStorage.setItem('login', JSON.stringify(data));
          localStorage.setItem('rut', clean(this.datosLogin.value.rut));
          localStorage.setItem('nombre', data.usuario?.nombre || 'Usuario');

          // Snackbar de éxito
          this.snackBar.open('¡Bienvenido!', 'Cerrar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });

          // Redirigir a transferencias (NO historial)
          this.router.navigate(['/transferencias']);
        } else {
          this.snackBar.open('Usuario o contraseña incorrectos', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error: any) => {
        this.loadingService.hide();
        this.snackBar.open('Usuario o contraseña incorrectos', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Submit del formulario de registro
   */
  public async submitRegistro(): Promise<void> {
    if (this.datosRegistro.invalid) {
      this.marcarCamposComoTocados(this.datosRegistro);
      return;
    }

    // Diálogo de confirmación con Material
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar Registro',
        message: '¿Deseas crear tu cuenta de usuario?',
        confirmText: 'Sí, crear cuenta',
        cancelText: 'Cancelar',
        type: 'info'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean) => {
      if (!confirmed) return;

      this.loadingService.show('Creando cuenta...');

      try {
        const response = await this._cs.registroUsuario(this.datosRegistro.value);

        this.loadingService.hide();

        if (response.ok) {
          this.snackBar.open('¡Cuenta creada exitosamente!', 'Cerrar', {
            duration: 4000,
            panelClass: ['success-snackbar']
          });

          // Cambiar al tab de login y pre-llenar RUT
          this.selectedTabIndex = 0;
          this.datosLogin.patchValue({
            rut: this.datosRegistro.value.rut
          });
          this.datosRegistro.reset();
        } else {
          this.snackBar.open('Error al crear la cuenta. Intenta nuevamente.', 'Cerrar', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
        }
      } catch (error) {
        this.loadingService.hide();
        this.snackBar.open('Error al crear la cuenta. Intenta nuevamente.', 'Cerrar', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
        console.error('Error en registro:', error);
      }
    });
  }
}
