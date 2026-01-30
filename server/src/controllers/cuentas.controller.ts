import { DestinatarioNuevo } from '../interface/request.interface';
import { Destinatarios } from '../interface/user.interface';
import { UserModel } from '../models/user.model';

export class CuentasController {
	public usermodel: UserModel = new UserModel();

	/**
	 * Metodo para conexion a Mongo y obtener los datos de
	 * de destinatarios del usuario
	 * @param number user_id
	 * @return Transferencia transferencias
	 */
	public async obtenerDestinatarios(rut: any): Promise<Destinatarios[] | undefined> {
		try {
			let destinatarios: Destinatarios[] = await this.usermodel.buscarDestinatarios(rut);
			if (null !== destinatarios) {
				return destinatarios;
			} else {
				return [];
			}
		} catch (error: any) {
			console.error(error.message);
		}
	}

	/**
	 *
	 */
	public async nuevoDestinatario(rutCliente: string, destinatario: DestinatarioNuevo): Promise<boolean> {
		try {
			if (!destinatario.email || !destinatario.rut_destinatario || !destinatario.nombre) {
				return false;
			}
			//por ahora no puedo revisar  el estado de la actualizacion
			let result = await this.usermodel.agregarNuevoDestinatario(rutCliente, destinatario);
			return result;
		} catch (error: any) {
			console.error(error.message);
			return false;
		}
	}
}
