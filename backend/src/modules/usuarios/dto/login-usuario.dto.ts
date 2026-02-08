import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUsuarioDto {
  @ApiProperty({
    description:
      'RUT del usuario con formato chileno (número-dígito verificador)',
    example: '12345678-9',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El RUT es requerido' })
  rut: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
