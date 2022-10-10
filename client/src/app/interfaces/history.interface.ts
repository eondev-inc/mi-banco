export interface ListaHistorial {
	historial: Historial[];
}

export interface Historial {
	nombre: string;
	rut: string;
	banco: string;
	tipo_cuenta: string;
	monto: number;
	fecha: string;
}
