import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'comunas',
  autoIndex: process.env.NODE_ENV !== 'production',
})
export class Comuna extends Document {
  @Prop({ required: true, type: String, index: true })
  nombre: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Region', index: true })
  regionId: Types.ObjectId;
}

export const ComunaSchema = SchemaFactory.createForClass(Comuna);

// Compound index: comuna name is unique within a region
ComunaSchema.index({ nombre: 1, regionId: 1 }, { unique: true });
