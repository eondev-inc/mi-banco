import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ListaBancos } from '../../interfaces/bank-list.interface';
import Swal from 'sweetalert2';
import { ComunicationService } from '../../services/comunication-services.service';

@Component({
	selector: 'app-transferencias',
	templateUrl: './transferencias.component.html',
	styleUrls: ['./transferencias.component.css'],
})
export class TransferenciasComponent implements OnInit {
	filteredOptions: Observable<any[]>;
	busquedaResultados: any[] = [];
	busquedaControl: FormControl = new FormControl();
	datosTransferencia!: FormGroup;
	resultados: any[] = [];
	rut!: any;
	constructor(private _cs: ComunicationService, private fb: FormBuilder) {}

	ngOnInit(): void {
		this.init();
		this.obtenerDatos();
		this.filteredOptions = this.busquedaControl.valueChanges.pipe(
			startWith(''),
			map((value) => this._filtro(value))
		);
		this.crearFormulario();
	}

	get montoNoValido() {
		return (
			this.datosTransferencia.get('monto')!.invalid &&
			this.datosTransferencia.get('monto')!.touched &&
			Number(this.datosTransferencia.get('monto')!.value) !== 0
		);
	}

	crearFormulario() {
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

	public async obtenerDatos() {
		this.init();
		this._cs.buscarDestinatarios(this.rut).subscribe({
			next: (response: HttpResponse<any>) => {
				this.busquedaResultados = response.body.destinatarios;
				console.log('Destinatarios', this.busquedaResultados);
			},
			error: (error: any) => {
				console.error(error.message);
				Swal.fire(`No tienes destinatarios`);
			}
		});
	}

	private init() {
		let login = JSON.parse(localStorage.getItem('login'));

		if (Object.keys(login).length > 0) {
			this.rut = login.usuario.rut;
		}
	}

	private _filtro(value: string): string[] {
		const filterValue = value.toLowerCase();

		return this.busquedaResultados.filter((option) => option.nombre.toLowerCase().includes(filterValue));
	}

	/**
	 * Filtrar el ARRAY resultado segun el valor sseleccionado para
	 * @param $event
	 */
	selectedOne($event: any) {
		let input = $event.target.value.toLowerCase();

		this.resultados = this.busquedaResultados.filter((option) => option.nombre.toLowerCase().includes(input));
		this.datosTransferencia.setValue({
			rut_destinatario: this.resultados[0].rut_destinatario,
			nombre: this.resultados[0].nombre,
			email: this.resultados[0].email,
			banco: this.resultados[0].banco,
			tipo_cuenta: this.resultados[0].tipo_cuenta,
			cuenta: this.resultados[0].numero_cuenta,
			monto: 0,
		});
	}

	public enviarTranferencia() {
		//Si el formulario no es valido entonces se hace una evaluación de cada uno
		//de los elementos reactivos y se hace resaltar en la vista cuales son los
		//elementos no validos
		console.log(this.datosTransferencia.invalid);
		if (this.datosTransferencia.invalid) {
			Swal.fire({ title: `El monto debe ser mayor a 0`, toast: true });
			return Object.values(this.datosTransferencia.controls).forEach((control) => {
				if (control instanceof FormGroup) {
					Object.values(control.controls).forEach((control) => control.markAsTouched());
				}
			});
		} else {
			//Si es valido entonces deebmos cargar un loading en la Vista
			//TODO: SwalFire
			Swal.fire({
				title: 'Deseas realizar la transferencia',
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
							.guardarTransferencia(login.usuario.rut, this.datosTransferencia.value)
							.then((res: HttpResponse<any>) => {
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
					Swal.fire({ title: `Se realizo transferencia`, toast: true });
					this.datosTransferencia.reset();
					/* this.router.navigateByUrl('/', {
					state: {
						message: 'Todo OK, eres vergatario',
					},
				}); */
				}
			});
		}
	}
}
