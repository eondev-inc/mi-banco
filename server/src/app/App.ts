'use strict';
import cors from 'cors';
import express from 'express';
import { Usuario } from '../routes/usuario.routes';
import { Cuentas } from '../routes/cuentas.routes';
import { Transferencias } from '../routes/transferencia.routes';

/**
 * El servidor que convierte la aplicacion en una API REST
 *
 * @class Server
 */
class Server {
	public app: express.Application;

	/**
	 * Bootstrap de la aplicacion me retorna la instancia Server.
	 *
	 * @class Server
	 * @method bootstrap
	 * @static
	 */
	public static bootstrap(): Server {
		return new Server();
	}

	/**
	 * Constructor.
	 *
	 * @class Server
	 * @constructor
	 */
	constructor() {
		//crear la aplicacion express
		this.app = express();

		//configurar la aplicacion
		this.config();

		//configurar las rutas
		this.routes();
	}

	/**
	 * Configure application
	 *
	 * @class Server
	 * @method config
	 * @return void
	 */
	private config() {
		//Usar express built-in para manejar JSON de entrada
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
		this.app.use(cors());
		// Caputar el error 404
		this.app.use(function (err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
			//var error = new Error("Not Found")
			err.status = 404;
			next(err);
		});
	}

	/**
	 * Configurando las rutas/endpoints para el servicio REST
	 *
	 * @class Server
	 * @method routes
	 * @return void
	 */
	private routes(): void {
		//obtener el router
		//obtener el router
		let router: express.Router;
		router = express.Router();

		/* let historial: Historial = new Historial();
		//RUTA historial de transferencias
		router.get('/historial', historial.index.bind(historial.index)); */

		let cuentas: Cuentas = new Cuentas();
		//RUTA inscribir cuentas o consultar por las cuentas de los usuarios
		router.get('/cuentas', cuentas.index.bind(cuentas.index));
		router.post('/cuentas', cuentas.index.bind(cuentas.index));

		let transferencia: Transferencias = new Transferencias();
		//RUTA realizar una  transferencia y guardar en base de datos
		router.get('/transferencias', transferencia.index.bind(transferencia.index));
		router.post('/transferencias', transferencia.index.bind(transferencia.index));

		let user: Usuario = new Usuario();
		router.get('/usuario', user.index.bind(user.index));
		router.post('/usuario', user.index.bind(user.index));

		//Usar el router previamente configurado
		this.app.use(router);
	}
}
//Creacion del servidor app y exportacion para uso en bin/www.ts
var server: Server = Server.bootstrap();
export default server.app;
