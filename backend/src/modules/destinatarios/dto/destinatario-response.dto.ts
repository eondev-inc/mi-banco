import { ApiProperty } from '@nestjs/swagger';

export class DestinatarioResponseDto {
  @ApiProperty({
    description: 'Nombre del destinatario/beneficiario',
    example: 'María',
  })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del destinatario/beneficiario',
    example: 'González López',
  })
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del destinatario',
    example: 'maria.gonzalez@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'RUT del destinatario',
    example: '98765432-1',
  })
  rut_destinatario: string;

  @ApiProperty({
    description: 'Número de teléfono del destinatario',
    example: '+56912345678',
  })
  telefono: string;

  @ApiProperty({
    description: 'Nombre del banco',
    example: 'Banco de Chile',
  })
  banco: string;

  @ApiProperty({
    description: 'Tipo de cuenta bancaria',
    example: 'Corriente',
  })
  tipo_cuenta: string;

  @ApiProperty({
    description: 'Número de cuenta bancaria',
    example: 123456789,
  })
  numero_cuenta: number;

  constructor(partial: Partial<DestinatarioResponseDto>) {
    Object.assign(this, partial);
  }
}
