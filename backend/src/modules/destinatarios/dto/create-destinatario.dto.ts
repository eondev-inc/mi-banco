import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsNumber,
  Matches,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDestinatarioDto {
  @ApiProperty({
    description: 'RUT del cliente que registra el destinatario',
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
    description: 'Nombre del destinatario/beneficiario',
    example: 'María',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del destinatario/beneficiario',
    example: 'González López',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del destinatario/beneficiario',
    example: 'maria.gonzalez@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description: 'RUT del destinatario/beneficiario',
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
    description: 'Número de teléfono del destinatario',
    example: '+56912345678',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  telefono: string;

  @ApiProperty({
    description: 'Nombre del banco del destinatario',
    example: 'Banco de Chile',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El banco es requerido' })
  banco: string;

  @ApiProperty({
    description: 'Tipo de cuenta bancaria (Corriente, Vista, Ahorro)',
    example: 'Corriente',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El tipo de cuenta es requerido' })
  tipo_cuenta: string;

  @ApiProperty({
    description: 'Número de cuenta bancaria del destinatario',
    example: 123456789,
    required: true,
    minimum: 1,
  })
  @IsNumber({}, { message: 'El número de cuenta debe ser un número' })
  @Min(1, { message: 'El número de cuenta debe ser mayor a 0' })
  numero_cuenta: number;
}
