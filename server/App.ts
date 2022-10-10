"use strict";
import {bodyParser } from "body-parser";
import * as express from "express";

/**
 * El servidor que convierte la aplicacion en una API REST
 *
 * @class Server
 */
 class Server {

    public app: express.Application;
  
    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     */
    public static bootstrap(): Server {
      return new Server()
    }
  
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
      //crear la aplicacion express
      this.app = express()
  
      //configurar la aplicacion
      this.config()
  
      //configurar las rutas
      this.routes()
    }
  
    /**
     * Configure application
     *
     * @class Server
     * @method config
     * @return void
     */
    private config() {
    
      //Use del body-parser para manejar JSON de entrada
      this.app.use(bodyParser.json())
      this.app.use(bodyParser.urlencoded({ extended: true }))
  
      // Caputar el error 404
      this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        var error = new Error("Not Found")
        err.status = 404;
        next(err);
      })
    }
  
    /**
     * Configurando las rutas/endpoints para el servicio REST
     *
     * @class Server
     * @method routes
     * @return void
     */
    private routes() {
      //obtener el router
      let router: express.Router = express.Router();
        
    }
}