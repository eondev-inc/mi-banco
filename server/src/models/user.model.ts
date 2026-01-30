import * as UserSchema from '../schemes/users.scheme';
import { Destinatarios, Transferencia, User } from '../interface/user.interface';
import { connect, model, Model } from 'mongoose';
import { DestinatarioNuevo, TransferenciaNueva, UsuarioNuevo } from '../interface/request.interface';

export class UserModel {
	private userModel: Model<User>;

	constructor() {
		this.conexionMongo();
		// Crear el modelo una sola vez en el constructor
		this.userModel = model<User>('User', UserSchema.default);
	}

	/**
	 * Metodo para conexion a la BD Mongo
	 */
	private async conexionMongo() {
		try {
			await connect('mongodb://mongo-db:27017/mi-banco');
		} catch (error: any) {
			console.error(error.message);
		}
	}
	/**
	 * Agreagar/ registrar usuario en la BD
	 */
	public async agregarNuevoUsuario(usuario: UsuarioNuevo): Promise<User | undefined> {
		try {
			//Crear el nuevo documento a insertar en la coleccion usuarios
			let doc = new this.userModel({
				nombre: usuario.nombre,
				email: usuario.email,
				rut: usuario.rut,
				password: usuario.password,
				destinatarios: [],
				transferencia: [],
			});

			//Realizar transaccion
			await doc.save();
			let createdUser: User = {
				nombre: doc.nombre,
				email: doc.email,
				rut: doc.rut,
				destinatarios: doc.destinatarios,
				transferencia: doc.transferencia,
			};
			return createdUser;
		} catch (error: any) {
			console.error(error.message);
		}
	}

	public async obtenerUsuario(rut: string, password: string): Promise<User | undefined> {
		try {
			let doc = await this.userModel.findOne(
				{ rut, password },
				'nombre correo rut destinatarios transferencia'
			).exec();

			if (null !== doc) {
				//*Se encontraron los destinatarios de la persona que quiere hacer la transferencia

				let response: User = doc;
				return response;
			}
			return undefined;
		} catch (error: any) {
			console.error(error.message);
		}
	}

	/**
	 * Metodo para agreagr un destinatario al documento User
	 * @param usuarioNuevo  @type UsuarioNuevo
	 *
	 */
	public async agregarNuevoDestinatario(rutCliente: string, destinatario: DestinatarioNuevo): Promise<boolean> {
		try {
			//* Se crea el objeto destinatarios para guardar en la coleccion que s
			//* coincida con el RUT que lo agreg[o]
			let destinatarios: Destinatarios = {
				nombre: destinatario.nombre,
				apellido: destinatario.apellido,
				email: destinatario.email,
				tipo_cuenta: destinatario.tipo_cuenta,
				banco: destinatario.banco,
				rut_destinatario: destinatario.rut_destinatario,
				telefono: destinatario.telefono,
				numero_cuenta: destinatario.numero_cuenta,
			};
			console.log(destinatarios);

			let doc = await this.userModel.updateOne({ rut: rutCliente }, { $push: { destinatarios } });
			if (doc.upsertedId) {
				return true;
			} else {
				return false;
			}
		} catch (error: any) {
			console.error(error.message);
			return false;
		}
	}

	/**
	 * Metodo para agreagr una transferencia al usuario
	 * @param params
	 */
	public async agregarNuevaTransferencia(rutCliente: any, transferencia: TransferenciaNueva): Promise<boolean> {
		try {
			//* Se crea el objeto transferencia para guardar en la coleccion que s
			//* coincida con el RUT que la realiz[o]
			let transferenciaInsert: Transferencia = {
				nombre: transferencia.nombre,
				banco: transferencia.banco,
				email: transferencia.email,
				rut_destinatario: transferencia.rut_destinatario,
				monto: transferencia.monto,
				tipo_cuenta: transferencia.tipo_cuenta,
			};

			let doc = await this.userModel.updateOne({ rut: rutCliente }, { $push: { transferencia: transferenciaInsert } });
			console.log(doc);
			if (doc.upsertedId) {
				return true;
			}
			return false;
		} catch (error: any) {
			console.error(error.message);
			return false;
		}
	}

	/**
	 * Metodo para buscar el listado de destinatarios del cliente
	 * @param params
	 * @return Promise any
	 */
	public async buscarDestinatarios(rut: any): Promise<any> {
		try {
			let doc = await this.userModel.findOne({ rut }).exec();

			if (null !== doc) {
				//*Se encontraron los destinatarios de la persona que quiere hacer la transferencia
				return doc.destinatarios;
			} else {
				//! No se encontraron los destinatarios !!!
				return null;
			}
		} catch (error: any) {
			console.error(error.message);
		}
	}
	/**
	 * Metodo para buscar el listado de transferencias del cliente
	 * @param params
	 * @return Promise any
	 */
	public async buscarTransferencias(params: any): Promise<any> {
		try {
			let doc = await this.userModel.findOne({ rut: params }).exec();

			if (null !== doc) {
				//*Se encontraron el historial de transferencia
				return doc.transferencia;
			} else {
				//! No se encontraron los destinatarios !!!
				return null;
			}
		} catch (error: any) {
			console.error(error.message);
		}
	}
}
