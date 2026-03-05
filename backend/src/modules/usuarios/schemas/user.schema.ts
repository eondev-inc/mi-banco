import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import {
  IDestinatario,
  ITransferencia,
} from '@common/interfaces/user.interface';

@Schema({
  timestamps: true,
  collection: 'users',
  // Performance optimization: disable auto-indexing in production
  autoIndex: process.env.NODE_ENV !== 'production',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User extends Document {
  @Prop({ required: true, type: String })
  nombres: string;

  @Prop({ required: true, type: String })
  apellidos: string;

  @Prop({ required: true, type: String, unique: true, index: true })
  email: string;

  @Prop({ required: true, type: String, unique: true, index: true })
  rut: string;

  @Prop({ required: true, type: String, select: false })
  password: string;

  @Prop({ required: true, type: String })
  telefono: string;

  @Prop({ required: true, type: Date })
  fechaNacimiento: Date;

  @Prop({ required: true, type: String })
  direccion: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Region',
    index: true,
  })
  regionId: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Comuna',
    index: true,
  })
  comunaId: Types.ObjectId;

  // Virtual field — populated by Mongoose, not stored in DB
  nombreCompleto: string;

  @Prop({
    type: [
      {
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        email: { type: String, required: true },
        rut_destinatario: { type: String, required: true },
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

// Virtual: nombreCompleto for backward compatibility
UserSchema.virtual('nombreCompleto').get(function (this: User) {
  return `${this.nombres} ${this.apellidos}`;
});

// Compound indexes for common queries
UserSchema.index({ email: 1, rut: 1 }); // For user lookups
UserSchema.index({ 'destinatarios.rut_destinatario': 1 }); // For beneficiary lookups
UserSchema.index({ 'transferencia.fecha': -1 }); // For sorting transfers by date (descending)
UserSchema.index({ rut: 1, 'transferencia.fecha': -1 }); // Compound: user history sorted by date
