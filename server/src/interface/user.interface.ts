export interface User {
	nombre: string;
	email: string;
	rut: string;
	password?: string;
	transferencia?: Transferencia[];
	destinatarios?: Destinatarios[];
}

export interface Transferencia {
	nombre: string;
	email: string;
	rut_destinatario: string;
	banco: string;
	tipo_cuenta: string;
	monto: number;
	fecha?: string;
}

export interface Destinatarios {
	nombre: string;
	apellido: string;
	email: string;
	rut_destinatario: string;
	telefono: string;
	banco: string;
	tipo_cuenta: string;
	numero_cuenta: number;
}
