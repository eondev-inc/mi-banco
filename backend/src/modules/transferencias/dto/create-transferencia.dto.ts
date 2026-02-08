import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferenciaDto {
  @ApiProperty({
    description: 'RUT del cliente que realiza la transferencia',
    example: '12345678-9',
    required: true,
    pattern: '^[0-9]+-[0-9Kk]$',
  })
  @IsString()
  @IsNotEmpty({ message: 'El RUT del cliente es requerido' })
  @Matches(/^[0-9]+-[0-9Kk]$/, {
    message: 'El RUT del cliente debe tener formato válido',
  })
  rut_cliente: string;

  @ApiProperty({
    description: 'Nombre completo del destinatario',
    example: 'María González López',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del destinatario es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del destinatario',
    example: 'maria.gonzalez@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'RUT del destinatario de la transferencia',
    example: '98765432-1',
    required: true,
    pattern: '^[0-9]+-[0-9Kk]$',
  })
  @IsString()
  @IsNotEmpty({ message: 'El RUT del destinatario es requerido' })
  @Matches(/^[0-9]+-[0-9Kk]$/, {
    message: 'El RUT del destinatario debe tener formato válido',
  })
  rut_destinatario: string;

  @ApiProperty({
    description: 'Nombre del banco destino',
    example: 'Banco de Chile',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El banco es requerido' })
  banco: string;

  @ApiProperty({
    description: 'Tipo de cuenta bancaria destino (Corriente, Vista, Ahorro)',
    example: 'Corriente',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de cuenta es requerido' })
  tipo_cuenta: string;

  @ApiProperty({
    description: 'Monto a transferir en pesos chilenos (CLP)',
    example: 50000,
    required: true,
    minimum: 1,
  })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(1, { message: 'El monto debe ser mayor a 0' })
  monto: number;
}
