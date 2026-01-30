import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ListaBancos } from '../interfaces/bank-list.interface';
import { clean } from 'rut.js';
import { Observable, firstValueFrom } from 'rxjs';
import { RequestData } from '../interfaces/request-data.interface';
import { environment } from 'src/environments/environment';
import { ListaHistorial } from '../interfaces/history.interface';

@Injectable({
	providedIn: 'root',
})
export class ComunicationService {
	//Constructor donde inyectan dependencias para conexion
	constructor(private _client: HttpClient) {}

	/**
	 * Método para obtener el listado de bancos desde la URL
	 * @returns observable
	 */
	public getBankList(): Observable<ListaBancos> {
		return this._client.get<ListaBancos>(environment.banksUrl);
	}

	/**
	 * Metodo para guardar un nuevo destinatario de fondos de pensions ;D
	 * @param FormGroup values
	 * @return Observable
	 */

	public guardarFormulario(rut_cliente: string, data: any): Promise<HttpResponse<any>> {
		//TODO: Definir el objeto que debe ser enviado al servicio
		const requestData: RequestData = {
			rut_destinatario: clean(data.rut),
			nombre: data.nombre.trim(),
			apellido: data.apellido.trim(),
			email: data.email.trim(),
			telefono: data.telefono.trim(),
			banco: data.banco.trim(),
			numero_cuenta: data.cuenta.trim(),
			tipo_cuenta: data.tipo_cuenta.trim(),
			rut_cliente: clean(rut_cliente.trim()),
		};

		return firstValueFrom(this._client.post<HttpResponse<any>>(`${environment.apiUrl}/cuentas`, requestData, {}));
	}

	/**
	 * Metodo para obtener la lista de destinatarios de un usuario en particular
	 */

	public obtenerDestinatarios(userId: any): Observable<any> {
		return this._client.get(`${environment.apiUrl}/destinatarios`, {
			params: {
				user_id: userId,
			},
		});
	}

	public obtenerHistorial(rut: any): Observable<HttpResponse<ListaHistorial>> {
		return this._client.get<HttpResponse<ListaHistorial>>(`${environment.apiUrl}/transferencias`, {
			params: {
				rut: clean(rut),
			},
		});
	}

	public usuarioLogin(data: any): Observable<HttpResponse<any>> {
		return this._client.get<HttpResponse<any>>(`${environment.apiUrl}/usuario`, {
			params: {
				rut: clean(data.rut.trim()),
				password: data.password.trim(),
			},
		});
	}

	public guardarTransferencia(rut_cliente: any, data: any): Promise<HttpResponse<any>> {
		return firstValueFrom(this._client
			.post<HttpResponse<any>>(
				`${environment.apiUrl}/transferencias`,
				{
					rut_destinatario: clean(data.rut_destinatario.trim()),
					rut_cliente: rut_cliente,
					nombre: data.nombre.trim(),
					banco: data.banco.trim(),
					tipo_cuenta: data.tipo_cuenta.trim(),
					monto: data.monto,
				},
				{}
			));
	}
	public registroUsuario(data: any): Promise<HttpResponse<any>> {
		return firstValueFrom(this._client
			.post<HttpResponse<any>>(
				`${environment.apiUrl}/usuario`,
				{
					nombre: data.nombre.trim(),
					email: data.email.trim(),
					rut: clean(data.rut.trim()),
					password: data.password.trim(),
				},
				{}
			));
	}

	public buscarDestinatarios(rut: any): Observable<HttpResponse<any>> {
		return this._client.get<HttpResponse<any>>(`${environment.apiUrl}/cuentas`, {
			params: { rut: clean(rut.trim()) },
		});
	}
}
