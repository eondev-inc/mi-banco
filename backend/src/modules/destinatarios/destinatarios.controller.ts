import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { DestinatariosService } from './destinatarios.service';
import { CreateDestinatarioDto } from './dto/create-destinatario.dto';

@ApiTags('cuentas')
@Controller('cuentas')
export class DestinatariosController {
  constructor(private readonly destinatariosService: DestinatariosService) {}

  /**
   * POST /cuentas - Agregar nuevo destinatario
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Agregar un nuevo destinatario/beneficiario a un usuario',
  })
  @ApiBody({ type: CreateDestinatarioDto })
  @ApiResponse({
    status: 200,
    description: 'Destinatario agregado exitosamente al usuario',
    schema: {
      example: {
        ok: true,
        body: {
          message: 'Destinatario agregado exitosamente',
          created: {
            nombre: 'María',
            apellido: 'González López',
            email: 'maria.gonzalez@example.com',
            rut_destinatario: '98765432-1',
            telefono: '+56912345678',
            banco: 'Banco de Chile',
            tipo_cuenta: 'Corriente',
            numero_cuenta: 123456789,
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
  @ApiResponse({
    status: 409,
    description: 'El destinatario ya existe para este usuario',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'El destinatario con RUT 98765432-1 ya existe',
          error: 'Conflict',
        },
      },
    },
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createDestinatarioDto: CreateDestinatarioDto,
  ) {
    const result = await this.destinatariosService.create(
      createDestinatarioDto,
    );

    return {
      ok: true,
      body: {
        message: 'Destinatario agregado exitosamente',
        created: result,
      },
    };
  }

  /**
   * GET /cuentas?rut=xxx - Obtener destinatarios de un usuario
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener lista de destinatarios/beneficiarios de un usuario',
  })
  @ApiQuery({
    name: 'rut',
    description:
      'RUT del usuario propietario de las cuentas (formato: 12345678-9)',
    required: true,
    example: '12345678-9',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de destinatarios del usuario',
    schema: {
      example: {
        ok: true,
        body: {
          destinatarios: [
            {
              nombre: 'María',
              apellido: 'González López',
              email: 'maria.gonzalez@example.com',
              rut_destinatario: '98765432-1',
              telefono: '+56912345678',
              banco: 'Banco de Chile',
              tipo_cuenta: 'Corriente',
              numero_cuenta: 123456789,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'RUT faltante en la petición',
    schema: {
      example: {
        ok: false,
        body: {
          message: 'El RUT es requerido',
          error: 'Bad Request',
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
  async findByRut(@Query('rut') rut: string) {
    if (!rut) {
      throw new BadRequestException('El RUT es requerido');
    }

    const destinatarios = await this.destinatariosService.findByRut(rut);

    return {
      ok: true,
      body: {
        destinatarios,
      },
    };
  }
}
