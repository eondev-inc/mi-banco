import express from 'express';
import { CuentasController } from '../controllers/cuentas.controller';
import { Destinatarios } from '../interface/user.interface';
/**
 * Crear la clase Historial con el metodo index de acceso libre por
 * metodo HTTP
 */
export class Cuentas {
	private cuentasController!: CuentasController;

	public async index(req: express.Request, res: express.Response) {
		this.cuentasController = new CuentasController();
		//Extraccion del metdo HTTP desde la interfaz Request
		let { method } = req;

		switch (method.toUpperCase()) {
			case 'GET':
				try {
					let { rut } = req.query;
					if (null != rut) {
						let resultGet: Destinatarios[] = (await this.cuentasController.obtenerDestinatarios(rut)) || [];
						//* Validar si el resultado devolvio valores
						console.log(resultGet);
						if (Object.keys(resultGet).length > 0) {
							res.status(200).send({
								ok: true,
								body: { destinatarios: resultGet },
							});
						} else {
							//! No se encontraron destinatarios!!!
							res.status(404).send({
								ok: false,
								body: { message: `El cliente ${rut} no tiene destinatarios` },
							});
						}
					} else {
						//! Sin RUT no se puede realizar una busqueda
						res.status(401).send({
							ok: false,
							body: { message: `Sin RUT no puedo buscar -.-' ` },
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
					let { rut_cliente } = req.body;
					if (null != rut_cliente && rut_cliente.length > 0) {
						let resultPost = await this.cuentasController.nuevoDestinatario(rut_cliente, req.body);

						if (resultPost) {
							//* Si la transferencia se guardo correctactmente devolver estado OK
							res.status(200).send({
								ok: true,
								body: {
									message: `Destinatario guardado!`,
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
