import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez González',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description:
      'RUT del usuario con formato chileno (número-dígito verificador)',
    example: '12345678-9',
    required: true,
    pattern: '^[0-9]+-[0-9Kk]$',
  })
  @IsString()
  @IsNotEmpty({ message: 'El RUT es requerido' })
  @Matches(/^[0-9]+-[0-9Kk]$/, {
    message: 'El RUT debe tener el formato correcto (ej: 12345678-9)',
  })
  rut: string;

  @ApiProperty({
    description:
      'Contraseña del usuario (mínimo 6 caracteres, será encriptada con bcrypt)',
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
