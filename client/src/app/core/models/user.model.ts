export interface User {
  _id?: string;
  nombre: string;
  email: string;
  rut: string;
  saldo?: number;
}

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  rut: string;
  password: string;
}

export interface Beneficiary {
  _id?: string;
  rut_destinatario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  banco: string;
  numero_cuenta: string;
  tipo_cuenta: string;
  rut_cliente: string;
}

export interface Transfer {
  _id?: string;
  rut_destinatario: string;
  rut_cliente: string;
  nombre: string;
  banco: string;
  tipo_cuenta: string;
  monto: number;
  fecha?: string;
  estado?: 'completada' | 'pendiente' | 'rechazada';
}

export interface Bank {
  name: string;
  id: string;
}

export interface AccountSummary {
  saldo: number;
  ingresos: number;
  egresos: number;
  transferenciasRecientes: number;
}
