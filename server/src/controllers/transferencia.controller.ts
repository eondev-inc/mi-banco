import { TransferenciaNueva } from '../interface/request.interface';
import { Transferencia } from '../interface/user.interface';
import { UserModel } from '../models/user.model';

export class TransferenciaController {
	private usermodel!: UserModel;

	constructor() {
		this.usermodel = new UserModel();
	}
	/**
	 * Metodo para conexion a Mongo y obtener los datos del historial
	 * de transferencias del usuario
	 * @param number user_id
	 * @return Transferencia transferencias
	 */
	public async obtenerTransferencias(rut: any): Promise<Transferencia[] | undefined> {
		//TODO?
		//! Ahora viene lo bueno que es el acceso a los datos
		try {
			let transferencias: Transferencia[] = await this.usermodel.buscarTransferencias(rut);
			if (null !== transferencias) {
				return transferencias;
			}
			return [];
		} catch (error) {
			console.error(error.message);
		}
	}

	/**
	 * Metodo para crear una transferencia hacia un destinatario
	 */
	public async nuevaTransferencia(rutCliente: any, transferencia: TransferenciaNueva): Promise<boolean> {
		try {
			//por ahora no puedo revisar  el estado de la actualizacion
			if (!transferencia.rut_destinatario) {
				return false;
			}
			let result = await this.usermodel.agregarNuevaTransferencia(rutCliente, transferencia);
			return result;
		} catch (error) {
			console.error(error.message);
			return false;
		}
	}
}
