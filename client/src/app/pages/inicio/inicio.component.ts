import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { validate, clean, format } from 'rut.js';
import Swal from 'sweetalert2';
import { ComunicationService } from '../../services/comunication-services.service';

@Component({
	selector: 'app-inicio',
	templateUrl: './inicio.component.html',
	styleUrls: ['./inicio.component.css'],
})
export class InicioComponent implements OnInit {
	public datosLogin!: FormGroup;
	public datosRegistro!: FormGroup;
	public alreadyLogged: boolean = false;
	public sesion: any;
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
	constructor(private fb: FormBuilder, private _cs: ComunicationService, private router: Router) {}

	ngOnInit(): void {
		this.crearFormularios();
		this.chequearSesion();
	}

	/**
	 * Definicion de Getter's parar la validacion de formularios
	 * los metodos GET devuelven un booleano según la evaluación
	 * y son invocados por angular dentro del html como si fueran un observable
	 */
	get nombreNoValido() {
		return this.datosRegistro.get('nombre')!.invalid && this.datosRegistro.get('nombre')!.touched;
	}
	get emailNoValido() {
		return this.datosRegistro.get('email')!.invalid && this.datosRegistro.get('email')!.touched;
	}

	get passwordNoValidoLogin() {
		return this.datosLogin.get('password')!.invalid && this.datosLogin.get('password')!.touched;
	}
	get rutNoValido() {
		return this.datosRegistro.get('rut')!.invalid && this.datosRegistro.get('rut')!.touched;
	}
	get passwordNoValidoRegistro() {
		return this.datosRegistro.get('password')!.invalid && this.datosRegistro.get('password')!.touched;
	}

	get rutLogin() {
		return this.datosLogin.get('rut') as FormControl;
	}
	get rutNoValidoLogin() {
		return this.datosLogin.get('rut')!.invalid && this.datosLogin.get('rut')!.touched;
	}

	get rut() {
		return this.datosRegistro.get('rut') as FormControl;
	}

	private chequearSesion() {
		this.sesion = JSON.parse(localStorage.getItem('login') || '{}');

		if (this.sesion) {
			if (Object.keys(this.sesion).length > 0) {
				this.alreadyLogged = true;
			}
		}
	}
	/**
	 * Metodo para instanciar el formulario Reactivo
	 */
	private async crearFormularios() {
		//Se crea la instancia FromGroup para el formulario reactivo
		//Definiendo las reglas de validacion para cada campo del formulario
		this.datosLogin = this.fb.group({
			rut: ['', [Validators.required]],
			password: ['', [Validators.required, Validators.minLength(8)]],
		});

		this.datosRegistro = this.fb.group({
			nombre: [
				'',
				[Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZzñÑáéíóúÁÉÍÓÚ]+$')],
			],
			email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
			rut: ['', [Validators.required]],
			password: ['', [Validators.required, Validators.minLength(8)]],
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
				this.rutLogin.setErrors({ rutNovalido: true });
				this.rutLogin.markAsDirty();
				this.rut.setErrors({ rutNovalido: true });
				this.rut.markAsDirty();
			} else {
				this.rutLogin.setErrors(null);
				this.rutLogin.setValue(formateado);
				this.rut.setErrors(null);
				this.rut.setValue(formateado);
			}
		} else {
			this.rut.setErrors({ rutNovalido: true });
			this.rut.markAsDirty();
		}
	}

	public async submitLogin() {
		//Si el formulario no es valido entonces se hace una evaluación de cada uno
		//de los elementos reactivos y se hace resaltar en la vista cuales son los
		//elementos no validos
		console.log(this.datosLogin.invalid);
		if (this.datosLogin.invalid) {
			return Object.values(this.datosLogin.controls).forEach((control) => {
				if (control instanceof FormGroup) {
					Object.values(control.controls).forEach((control) => control.markAsTouched());
				}
			});
		}
		this._cs.usuarioLogin(this.datosLogin.value).subscribe(
			(response: HttpResponse<any>) => {
				if (response.ok) {
					let data = response.body;
					if (data) {
						localStorage.setItem('login', JSON.stringify(data));
						this.router.navigate(['/historial']).then(() => {
							window.location.reload();
						});
					}
				} else {
					Swal.fire(`usuario o contrasena incorrectos`);
				}
			},
			(error: any) => {
				Swal.fire(`usuario o contrasena incorrectos`);
			}
		);
	}

	public async submitRegistro() {
		//Si el formulario no es valido entonces se hace una evaluación de cada uno
		//de los elementos reactivos y se hace resaltar en la vista cuales son los
		//elementos no validos
		if (this.datosRegistro.invalid) {
			return Object.values(this.datosRegistro.controls).forEach((control) => {
				if (control instanceof FormGroup) {
					Object.values(control.controls).forEach((control) => control.markAsTouched());
				}
			});
		}

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

				this._cs
					.registroUsuario(this.datosRegistro.value)
					.then((response: HttpResponse<any>) => {
						if (response.ok) {
							Swal.fire(`Se ha creado tu usuario`);
							return response.body;
						}
					})
					.catch((error) => {
						console.error(error.message);
					});
			},
		}).then((result) => {
			if (result.isConfirmed) {
				console.log(result.value);
				Swal.fire({ title: `Los datos fueron guardados correctamente`, toast: true });
			}
		});
	}
}
