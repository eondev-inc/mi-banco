import {
  IDestinatario,
  ITransferencia,
} from '@common/interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class UsuarioResponseDto {
  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
  })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
  })
  apellidos: string;

  @ApiProperty({
    description: 'Nombre completo (virtual: nombres + apellidos)',
    example: 'Juan Carlos Pérez González',
  })
  nombreCompleto: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'RUT del usuario',
    example: '12345678-9',
  })
  rut: string;

  @ApiProperty({
    description: 'Teléfono del usuario',
    example: '+56912345678',
  })
  telefono: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
  })
  fechaNacimiento: Date;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: "Av. Libertador Bernardo O'Higgins 1234",
  })
  direccion: string;

  @ApiProperty({
    description: 'ID de la región',
    example: '6507a1f2e4b0a1b2c3d4e5f6',
  })
  regionId: Types.ObjectId;

  @ApiProperty({
    description: 'ID de la comuna',
    example: '6507a1f2e4b0a1b2c3d4e5f7',
  })
  comunaId: Types.ObjectId;

  @ApiProperty({
    description: 'Lista de destinatarios/beneficiarios asociados al usuario',
    required: false,
    type: 'array',
    example: [],
  })
  destinatarios?: IDestinatario[];

  @ApiProperty({
    description: 'Lista de transferencias realizadas por el usuario',
    required: false,
    type: 'array',
    example: [],
  })
  transferencia?: ITransferencia[];

  constructor(partial: Partial<UsuarioResponseDto>) {
    Object.assign(this, partial);
  }
}
