import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';

@ApiTags('usuarios')
@Controller('usuario')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * POST /usuario - Crear nuevo usuario
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear un nuevo usuario en el sistema' })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({
    status: 200,
    description:
      'Usuario creado exitosamente. La contraseña es encriptada con bcrypt.',
    schema: {
      example: {
        ok: true,
        body: {
          usuario: {
            nombre: 'Juan Pérez González',
            email: 'juan.perez@example.com',
            rut: '12345678-9',
            destinatarios: [],
            transferencia: [],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o faltantes',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'Validation failed',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya existe (RUT duplicado)',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'El usuario con RUT 12345678-9 ya existe',
          error: 'Conflict',
        },
      },
    },
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createUsuarioDto: CreateUsuarioDto,
  ) {
    const usuario = await this.usuariosService.create(createUsuarioDto);

    return {
      ok: true,
      body: {
        usuario,
      },
    };
  }

  /**
   * POST /usuario/login - Login de usuario
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuario (login)' })
  @ApiBody({ type: LoginUsuarioDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso. La contraseña es verificada con bcrypt.',
    schema: {
      example: {
        ok: true,
        body: {
          usuario: {
            nombre: 'Juan Pérez González',
            email: 'juan.perez@example.com',
            rut: '12345678-9',
            destinatarios: [],
            transferencia: [],
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o faltantes',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'Validation failed',
          error: 'Bad Request',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'Credenciales inválidas',
          error: 'Unauthorized',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'Usuario con RUT 12345678-9 no encontrado',
          error: 'Not Found',
        },
      },
    },
  })
  async login(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    loginDto: LoginUsuarioDto,
  ) {
    const usuario = await this.usuariosService.login(loginDto);

    return {
      ok: true,
      body: {
        usuario,
      },
    };
  }
}
