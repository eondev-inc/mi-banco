import express from 'express';
import { Transferencia } from '../interface/user.interface';
import { TransferenciaController } from '../controllers/transferencia.controller';
/**
 * Crear la clase Transferencia con el metodo index de acceso libre por
 * metodo HTTP
 */
export class Transferencias {
	private transferenciaController!: TransferenciaController;

	public async index(req: express.Request, res: express.Response) {
		this.transferenciaController = new TransferenciaController();
		//Extraccion del metdo HTTP desde la interfaz Request
		let { method } = req;

		switch (method.toUpperCase()) {
			case 'GET':
				try {
					let { rut } = req.query;
					if (null != rut) {
						let resultGet: Transferencia[] =
							(await this.transferenciaController.obtenerTransferencias(rut)) || [];

						//* Validar si el resultado devolvio valores
						if (Object.keys(resultGet).length > 0) {
							//* Enviar respuesta OK al cliente
							res.status(200).send({
								ok: true,
								body: { historial: resultGet },
							});
						} else {
							//! No se encontraron transferencias!!!
							res.status(404).send({
								ok: false,
								body: { message: `El cliente ${rut} no tiene transferencias` },
							});
						}
					} else {
						//! Sin RUT no se puede realizar una busqueda
						res.status(401).send({
							ok: false,
							body: { message: `Sin RUT no puedo buscar -.-' ` },
						});
					}
				} catch (error) {
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
					//* Se extrae el rut_cliente de la peticion para el update
					let { rut_cliente } = req.body;
					//* Se llama a al metodo para guardar la transferencia
					if (null != rut_cliente && rut_cliente.length > 0) {
						let resultPost = await this.transferenciaController.nuevaTransferencia(rut_cliente, req.body);

						if (resultPost) {
							//* Si la transferencia se guardo correctactmente devolver estado OK
							res.status(200).send({
								ok: true,
								body: {
									message: `Transferencia guardada!`,
								},
							});
						} else {
							//! No se guardo la transferencia error no encontrado
							res.status(401).send({
								ok: false,
								body: { message: `No se guardo la transferencia para el cliente ${rut_cliente}` },
							});
						}
					} else {
						//! Sin RUT no se puede realizar una busqueda y actualizacion
						res.status(401).send({
							ok: false,
							body: { message: `Sin RUT no puedo buscar -.-' ` },
						});
					}
				} catch (error) {
					//! Error critico interno, no moistrar en cliente
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
