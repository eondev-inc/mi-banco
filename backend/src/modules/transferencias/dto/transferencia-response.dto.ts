import { ApiProperty } from '@nestjs/swagger';

export class TransferenciaResponseDto {
  @ApiProperty({
    description: 'Nombre completo del destinatario',
    example: 'María González López',
  })
  nombre: string;

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
    description: 'Nombre del banco destino',
    example: 'Banco de Chile',
  })
  banco: string;

  @ApiProperty({
    description: 'Tipo de cuenta bancaria',
    example: 'Corriente',
  })
  tipo_cuenta: string;

  @ApiProperty({
    description: 'Monto transferido en pesos chilenos (CLP)',
    example: 50000,
  })
  monto: number;

  @ApiProperty({
    description: 'Fecha y hora de la transferencia (generada automáticamente)',
    example: '2024-02-08T15:30:00.000Z',
  })
  fecha: Date;

  @ApiProperty({
    description: 'ID único de la transferencia (MongoDB ObjectId)',
    example: '507f1f77bcf86cd799439011',
    required: false,
  })
  _id?: string;

  constructor(partial: Partial<TransferenciaResponseDto>) {
    Object.assign(this, partial);
  }
}
