import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ListaBancos } from 'src/app/interfaces/bank-list.interface';
import { ComunicationService } from 'src/app/services/comunication-services.service';
import { validate, clean, format } from 'rut.js';
import { Router } from '@angular/router';

//Librería para notificaciones
import Swal from 'sweetalert2';

@Component({
	selector: 'app-registrar',
	templateUrl: './registrar.component.html',
	styleUrls: ['./registrar.component.css'],
})
export class RegistrarComponent implements OnInit {
	//Definimos un FromGroup para validacion de datos
	public datosTransferencia!: FormGroup;
	//Interfaz para la data
	public bancos!: ListaBancos;
	//Array de RUT's no validos
	noValidos: any[] = [
		'19',
		'1111111',
		'2222222',
		'3333333',
		'4444444',
		'5555555',
		'6666666',
		'7777777',
		'8888888',
		'9999999',
		'1234567',
		'7654321',
		'11111111',
		'22222222',
		'33333333',
		'44444444',
		'55555555',
		'66666666',
		'77777777',
		'88888888',
		'99999999',
		'12345678',
		'87654321',
	];
	//RegExp para validar correos en JS
	emailPattern: string =
		'^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$';

	//Inyección de dependencias en el oonstructor
	constructor(private fb: FormBuilder, private router: Router, private _cs: ComunicationService) {}

	//1. Crear el formulario una vez inicia Angular
	//2. Se obtiene el listado de bancos desde la URL php
	ngOnInit(): void {
		this.crearFormulario();
		this.getBankList();
	}

	/**
	 * Definicion de Getter's parar la validacion de formularios
	 * los metodos GET devuelven un booleano según la evaluación
	 * y son invocados por angular dentro del html como si fueran un observable
	 */
	get nombreNoValido() {
		return this.datosTransferencia.get('nombre')!.invalid && this.datosTransferencia.get('nombre')!.touched;
	}
	get apellidoNoValido() {
		return this.datosTransferencia.get('apellido')!!.invalid && this.datosTransferencia.get('apellido')!.touched;
	}
	get emailNoValido() {
		return this.datosTransferencia.get('email')!.invalid && this.datosTransferencia.get('email')!.touched;
	}
	get rutNoValido() {
		return this.datosTransferencia.get('rut')!.invalid && this.datosTransferencia.get('rut')!.touched;
	}
	get telefonoNoValido() {
		return this.datosTransferencia.get('telefono')!.invalid && this.datosTransferencia.get('telefono')!.touched;
	}
	get cuentanoValido() {
		return this.datosTransferencia.get('cuenta')!.invalid && this.datosTransferencia.get('cuenta')!.touched;
	}
	get tipoCuentanoValido() {
		return this.datosTransferencia.get('tipo_cuenta')!.invalid && this.datosTransferencia.get('cuenta')!.touched;
	}

	get rut() {
		return this.datosTransferencia.get('rut') as FormControl;
	}

	//Obtener los datos para los campos SELECT
	private async getBankList() {
		let bancos = JSON.parse(localStorage.getItem('bancos') || '{}');
		if (Object.keys(bancos).length > 0) {
			this.bancos = bancos;
		} else {
			this._cs.getBankList().subscribe(
				(response: ListaBancos) => {
					if (response) {
						this.bancos = response;
						localStorage.setItem('bancos', JSON.stringify(this.bancos));
						console.log('Registrar', JSON.stringify(this.bancos, null, 2));
					}
				},
				(error: any) => {
					Swal.fire({
						title: 'Fallas en la comunicación',
						text: `<p> ${error.message} <p>`,
						toast: true,
					});
				}
			);
		}
	}
	/**
	 * Metodo para instanciar el formulario Reactivo
	 */
	private async crearFormulario() {
		//Se crea la instancia FromGroup para el formulario reactivo
		//Definiendo las reglas de validacion para cada campo del formulario
		this.datosTransferencia = this.fb.group({
			nombre: [
				'',
				[Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZzñÑáéíóúÁÉÍÓÚ]+$')],
			],
			apellido: [
				'',
				[Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZzñÑáéíóúÁÉÍÓÚ]+$')],
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
	 * Metodo para enviar formulario al servicio e inscribir nueva cuenta
	 *
	 */
	public async enviarFormulario() {
		//Si el formulario no es valido entonces se hace una evaluación de cada uno
		//de los elementos reactivos y se hace resaltar en la vista cuales son los
		//elementos no validos
		if (this.datosTransferencia.invalid) {
			return Object.values(this.datosTransferencia.controls).forEach((control) => {
				if (control instanceof FormGroup) {
					Object.values(control.controls).forEach((control) => control.markAsTouched());
				}
			});
		}

		//Si es valido entonces deebmos cargar un loading en la Vista
		//TODO: SwalFire
		Swal.fire({
			title: 'Deseas guardar el destinatario',
			icon: 'warning',
			confirmButtonText: 'Sí, guardar',
			cancelButtonText: 'Cancelar',
			showLoaderOnConfirm: true,
			allowOutsideClick: false,
			preConfirm: () => {
				//El metodo preConfirm de Swal permite ejecutar una llamada ASYNC al servicio y esperar
				//la respuesta para continuar con la ejecución
				//Necesito recoger el rut del cliente
				let login = JSON.parse(localStorage.getItem('login'));
				if (Object.keys(login).length > 0) {
					return this._cs
						.guardarFormulario(login.usuario.rut, this.datosTransferencia.value)
						.then((res) => {
							if (res.ok) {
								return res.body;
							} else {
								return null;
							}
						})
						.catch((error) => {
							console.log(error.message);
							Swal.fire(`Ocurrio un error! ${error.message}`);
						});
				} else {
					return null;
				}
			},
		}).then((result) => {
			if (result.isConfirmed) {
				console.log(result.value);
				Swal.fire(`Los datos fueron guardados correctamente`);
				this.datosTransferencia.reset();
				/* this.router.navigateByUrl('/', {
					state: {
						message: 'Todo OK, eres vergatario',
					},
				}); */
			}
		});
	}

	/**
	 * Metodo para verificar y formatear el RUT del nuevo destinatario
	 * @param e (event)
	 */
	public verificarRut(e: any) {
		let esRutValido: boolean = this.noValidos.includes(e.target.value);
		console.log('Es RUT Valido: ' + esRutValido);

		//El rango inferior del RUT
		let esMayor: boolean = parseInt(e.target.value) > 1000000;
		//El Rango Superior del RUT
		let esMenor: boolean = parseInt(e.target.value) < 50000000;
		//Si el RUT es valido y se mantiene en el rango
		if (!esRutValido || (!esMenor && !esMayor)) {
			let cleanValue: string = clean(e.target.value);

			let esValido: boolean = validate(cleanValue);

			let formateado: string = format(cleanValue);

			if (!esValido) {
				this.rut.setErrors({ rutNovalido: true });
				this.rut.markAsDirty();
			} else {
				this.rut.setErrors(null);
				this.rut.setValue(formateado);
			}
		} else {
			this.rut.setErrors({ rutNovalido: true });
			this.rut.markAsDirty();
		}
	}
}
