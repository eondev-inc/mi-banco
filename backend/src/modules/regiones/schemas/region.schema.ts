import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'regiones',
  autoIndex: process.env.NODE_ENV !== 'production',
})
export class Region extends Document {
  @Prop({ required: true, type: String, unique: true, index: true })
  nombre: string;

  @Prop({ required: true, type: String, unique: true, index: true })
  codigo: string; // ISO 3166-2, e.g. 'CL-RM'

  @Prop({ required: true, type: String })
  ordinal: string; // 'RM', 'I', 'II', ..., 'XV', 'XVI'

  @Prop({ required: true, type: String })
  cut: string; // Código Único Territorial, e.g. '13'
}

export const RegionSchema = SchemaFactory.createForClass(Region);
