import { Document } from 'mongoose';

export interface ITransferencia {
  nombre: string;
  email: string;
  rut_destinatario: string;
  banco: string;
  tipo_cuenta: string;
  monto: number;
  fecha?: Date;
}

export interface IDestinatario {
  nombre: string;
  apellido: string;
  email: string;
  rut_destinatario: string;
  telefono: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: number;
}

export interface IUser {
  nombre: string;
  email: string;
  rut: string;
  password: string;
  destinatarios: IDestinatario[];
  transferencia: ITransferencia[];
}

export interface IUserDocument extends IUser, Document {}
