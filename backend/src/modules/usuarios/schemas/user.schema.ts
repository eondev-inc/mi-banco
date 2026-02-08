import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  IDestinatario,
  ITransferencia,
} from '@common/interfaces/user.interface';

@Schema({
  timestamps: true,
  collection: 'users',
  // Performance optimization: disable auto-indexing in production
  autoIndex: process.env.NODE_ENV !== 'production',
})
export class User extends Document {
  @Prop({ required: true, type: String })
  nombre: string;

  @Prop({ required: true, type: String, unique: true, index: true })
  email: string;

  @Prop({ required: true, type: String, unique: true, index: true })
  rut: string;

  @Prop({ required: true, type: String, select: false })
  password: string;

  @Prop({
    type: [
      {
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        email: { type: String, required: true },
        rut_destinatario: { type: String, required: true, index: true },
        telefono: { type: String, required: true },
        banco: { type: String, required: true },
        tipo_cuenta: { type: String, required: true },
        numero_cuenta: { type: Number, required: true },
      },
    ],
    default: [],
  })
  destinatarios: IDestinatario[];

  @Prop({
    type: [
      {
        nombre: { type: String, required: true },
        email: { type: String, required: true },
        rut_destinatario: { type: String, required: true },
        banco: { type: String, required: true },
        tipo_cuenta: { type: String, required: true },
        monto: { type: Number, required: true },
        fecha: { type: Date, default: Date.now, index: true },
      },
    ],
    default: [],
  })
  transferencia: ITransferencia[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound indexes for common queries
UserSchema.index({ email: 1, rut: 1 }); // For user lookups
UserSchema.index({ 'destinatarios.rut_destinatario': 1 }); // For beneficiary lookups
UserSchema.index({ 'transferencia.fecha': -1 }); // For sorting transfers by date (descending)
UserSchema.index({ rut: 1, 'transferencia.fecha': -1 }); // Compound: user history sorted by date
