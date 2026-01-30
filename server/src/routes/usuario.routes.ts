import express from 'express';
import { User } from '../interface/user.interface';
import { UsuarioController } from '../controllers/usuario.controller';

/**
 * Crear la clase Usuario con el metodo index de acceso libre por
 * metodo HTTP para crear y obtener la sesion del usuario
 */
export class Usuario {
	private usuarioController!: UsuarioController;

	public async index(req: express.Request, res: express.Response) {
		this.usuarioController = new UsuarioController();

		//Extraccion del metdo HTTP desde la interfaz Request
		let { method } = req;

		switch (method.toUpperCase()) {
			case 'GET':
				try {
					let { rut, password } = req.query;
					console.log(rut, password);
					if (null != rut && null != password) {
						let resultGet: User | undefined = await this.usuarioController.obtenerUsuario(
							rut.toString(),
							password.toString()
						);
						console.log(resultGet);
						//* Validar si el resultado devolvio valores
						if (undefined != resultGet) {
							res.status(200).send({
								ok: true,
								body: { usuario: resultGet },
							});
						} else {
							//! No se encontraron destinatarios!!!
							res.status(404).send({
								ok: false,
								body: { message: `${rut} no existe o contrasena no existe` },
							});
						}
					} else {
						//! Sin RUT no se puede realizar una busqueda
						res.status(401).send({
							ok: false,
							body: { message: `Sin RUT y sin Password no puedo buscar -.-' ` },
						});
					}
				} catch (error: any) {
					//! Error interno del servidor no mostrar en cliente
					res.status(500).send({
						ok: false,
						body: {
							message: `Error interno del servidor `,
							error: error.message,
						},
					});
				}

				break;
			case 'POST':
				try {
					if (Object.keys(req.body).length > 0) {
						let resultPost = await this.usuarioController.nuevoUsuario(req.body);
						if (resultPost) {
							//* Si la transferencia se guardo correctactmente devolver estado OK
							res.status(200).send({
								ok: true,
								body: {
									usuario: resultPost,
								},
							});
						} else {
							//! No se guardo la transferencia error no encontrado
							res.status(401).send({
								ok: false,
								body: { message: `No se guardo el nuevo usuario` },
							});
						}
					} else {
						//! Sin RUT no se puede realizar una busqueda y actualizacion
						res.status(401).send({
							ok: false,
							body: { message: `Entrega un rut -.-' ` },
						});
					}
				} catch (error: any) {
					//! Error interno del servidor no mostrar en cliente
					res.status(500).send({
						ok: false,
						body: {
							message: `Error interno del servidor `,
							error: error.message,
						},
					});
				}

			default:
				break;
		}
	}
}
