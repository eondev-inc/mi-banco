/**
 * Interface para el tipo de la solicitud que se realiza al
 * servicio de guardar los datos del destinatario.
 */

export interface RequestData {
	nombre: string;
	apellido: string;
	email: string;
	rut_destinatario: string;
	rut_cliente: string;
	telefono: string;
	banco: string;
	tipo_cuenta: number;
	numero_cuenta: number;
}
