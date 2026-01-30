import { UsuarioNuevo } from '../interface/request.interface';
import { User } from '../interface/user.interface';
import { UserModel } from '../models/user.model';

export class UsuarioController {
	private usermodel: UserModel = new UserModel();
	/**
	 * Metodo para conexion a Mongo y obtener los datos del historial
	 * de transferencias del usuario
	 * @param number user_id
	 * @return Transferencia transferencias
	 */
	public async obtenerUsuario(rut: string, password: string): Promise<User | undefined> {
		//TODO?
		//! Ahora viene lo bueno que es el acceso a los datos
		try {
			let user = await this.usermodel.obtenerUsuario(rut, password);
			if (null !== user) {
				console.log(user);
				return user;
			}
			return undefined;
		} catch (error: any) {
			console.error(error.message);
		}
	}

	/**
	 * Metodo para crear una transferencia hacia un destinatario
	 */
	public async nuevoUsuario(usuarioNuevo: UsuarioNuevo): Promise<User | undefined> {
		try {
			if (!usuarioNuevo.email || !usuarioNuevo.rut || !usuarioNuevo.nombre) {
				return;
			}
			//por ahora no puedo revisar  el estado de la actualizacion
			let result = await this.usermodel.agregarNuevoUsuario(usuarioNuevo);
			return result;
		} catch (error: any) {
			console.error(error.message);
		}
	}
}
