'use strict';
const app = require('../app/App');
const debug = require('debug')('express:server');
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;
const morgan = require('morgan');
//Iniciar el proceso de creación del servidor
var port = normalizePort(process.env.PORT || 8000);

app.default.set('port', port);
var server = http.createServer(app.default);
server.on('error', onError);
server.on('listening', onListening);

morgan(':method :url :status :res[content-length] - :response-time ms');

if (cluster.isMaster) {
	console.log(`Maestro ${process.pid} esta corriendo`);
	//fork del maestro pars los clusters
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker: any, code: any, signal: any) => {
		console.log(`Worker ${worker.process.pid} murio`);
	});
} else {
	// Workers pueden compartir cualquier conexion TCP
	// En ese caso es un servisor http
	var server = http.createServer(app.default);

	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	console.log(`Worker ${process.pid} Iniciado`);
}

/**
 * Verificar la validez del puerto configurado
 * @param val
 */
function normalizePort(val: any) {
	let port = parseInt(val, 10);

	if (isNaN(port)) {
		return val;
	}

	if (port >= 0) {
		return port;
	}

	return false;
}

/**
 * Manejo de errores en el arranque del servidor
 * @param error
 */
function onError(error: any) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' se necesitan altos privilegios');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' ya se encuentra en uso');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Loggin de inicio de servidor
 *
 */
function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	console.log('server now', ' Listening On: ' + bind);
}
