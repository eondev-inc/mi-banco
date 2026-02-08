import {
  IDestinatario,
  ITransferencia,
} from '@common/interfaces/user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class UsuarioResponseDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez González',
  })
  nombre: string;

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
