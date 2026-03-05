import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsDateString,
  IsMongoId,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Custom validator: user must be at least 18 years old.
 */
@ValidatorConstraint({ name: 'IsAdult', async: false })
export class IsAdultConstraint implements ValidatorConstraintInterface {
  validate(fechaNacimiento: string): boolean {
    const birth = new Date(fechaNacimiento);
    if (isNaN(birth.getTime())) return false;
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();
    const adjusted =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return adjusted >= 18;
  }

  defaultMessage(): string {
    return 'Debes tener al menos 18 años para registrarte';
  }
}

export class CreateUsuarioDto {
  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Los nombres son requeridos' })
  nombres: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  apellidos: string;

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
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({
    description:
      'Confirmación del correo electrónico (debe coincidir con email)',
    example: 'juan.perez@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'La confirmación de email debe ser válida' })
  @IsNotEmpty({ message: 'La confirmación del email es requerida' })
  emailConfirmacion: string;

  @ApiProperty({
    description: 'Teléfono chileno (9 dígitos, con o sin +56)',
    example: '+56912345678',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @Matches(/^(\+56)?9\d{8}$/, {
    message:
      'El teléfono debe tener formato chileno válido (ej: +56912345678 o 912345678)',
  })
  telefono: string;

  @ApiProperty({
    description:
      'Fecha de nacimiento (ISO 8601). El usuario debe tener ≥18 años.',
    example: '1990-05-15',
    required: true,
  })
  @IsDateString(
    {},
    {
      message: 'La fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)',
    },
  )
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  @Validate(IsAdultConstraint)
  fechaNacimiento: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: "Av. Libertador Bernardo O'Higgins 1234",
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  direccion: string;

  @ApiProperty({
    description: 'ID MongoDB de la región',
    example: '6507a1f2e4b0a1b2c3d4e5f6',
    required: true,
  })
  @IsMongoId({ message: 'El ID de región no es válido' })
  @IsNotEmpty({ message: 'La región es requerida' })
  regionId: string;

  @ApiProperty({
    description: 'ID MongoDB de la comuna',
    example: '6507a1f2e4b0a1b2c3d4e5f7',
    required: true,
  })
  @IsMongoId({ message: 'El ID de comuna no es válido' })
  @IsNotEmpty({ message: 'La comuna es requerida' })
  comunaId: string;

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
