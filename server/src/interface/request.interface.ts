export interface UsuarioNuevo {
	nombre: string;
	email: string;
	rut: string;
	password: string;
}

export interface TransferenciaNueva {
	nombre: string;
	email: string;
	rut_destinatario: string;
	banco: string;
	tipo_cuenta: string;
	monto: number;
}

export interface DestinatarioNuevo {
	nombre: string;
	apellido: string;
	email: string;
	rut_destinatario: string;
	telefono: string;
	banco: string;
	tipo_cuenta: string;
	numero_cuenta: number;
}
