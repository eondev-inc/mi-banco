import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListaHistorial } from 'src/app/interfaces/history.interface';
import { ComunicationService } from 'src/app/services/comunication-services.service';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-historial',
	templateUrl: './historial.component.html',
	styleUrls: ['./historial.component.css'],
})
export class HistorialComponent implements OnInit {
	//Creamos el objeto historial para su posterior maipulación
	public historial!: ListaHistorial;
	public state!: any;
	public rut!: any;
	//Inyectamos las dependecias en el constructor
	constructor(private _cs: ComunicationService, private activatedRoute: ActivatedRoute, private router: Router) {}

	ngOnInit(): void {
		this.initHistorial();
	}

	private initHistorial() {
		let login = JSON.parse(localStorage.getItem('login') || '{}');

		if (Object.keys(login).length > 0) {
			this.cargarHistorial(login.usuario.rut);
		}

		console.log('Historial', 'INIT');
	}

	private async cargarHistorial(rut: any) {
		this._cs.obtenerHistorial(rut).subscribe(
			(response: HttpResponse<ListaHistorial>) => {
				if (response) {
					this.historial = response.body;

					console.log('Historial', JSON.stringify(this.historial, null, 2));
				}
			},
			(error: any) => {
				Swal.fire(`Aun no tienes transferencias realizadas`);
				console.error(error);
			}
		);
	}
}
