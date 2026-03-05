import { Document, Types } from 'mongoose';

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
  nombres: string;
  apellidos: string;
  email: string;
  rut: string;
  password: string;
  telefono: string;
  fechaNacimiento: Date;
  direccion: string;
  regionId: Types.ObjectId;
  comunaId: Types.ObjectId;
  destinatarios: IDestinatario[];
  transferencia: ITransferencia[];
  // Virtual
  nombreCompleto?: string;
}

export interface IUserDocument extends IUser, Document {}
