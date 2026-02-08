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
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

@ApiTags('transferencias')
@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly transferenciasService: TransferenciasService) {}

  /**
   * POST /transferencias - Crear nueva transferencia
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Crear una nueva transferencia bancaria' })
  @ApiBody({ type: CreateTransferenciaDto })
  @ApiResponse({
    status: 200,
    description:
      'Transferencia creada y registrada exitosamente. La fecha se genera automáticamente.',
    schema: {
      example: {
        ok: true,
        body: {
          message: 'Transferencia guardada!',
          created: {
            nombre: 'María González López',
            email: 'maria.gonzalez@example.com',
            rut_destinatario: '98765432-1',
            banco: 'Banco de Chile',
            tipo_cuenta: 'Corriente',
            monto: 50000,
            fecha: '2024-02-08T15:30:00.000Z',
            _id: '507f1f77bcf86cd799439011',
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
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createTransferenciaDto: CreateTransferenciaDto,
  ) {
    const result = await this.transferenciasService.create(
      createTransferenciaDto,
    );

    return {
      ok: true,
      body: {
        message: 'Transferencia guardada!',
        created: result,
      },
    };
  }

  /**
   * GET /transferencias?rut=xxx - Obtener historial de transferencias
   */
  @Get()
  @ApiOperation({
    summary: 'Obtener historial de transferencias de un usuario',
  })
  @ApiQuery({
    name: 'rut',
    description:
      'RUT del usuario para consultar su historial de transferencias (formato: 12345678-9)',
    required: true,
    example: '12345678-9',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de transferencias del usuario, ordenado por fecha',
    schema: {
      example: {
        ok: true,
        body: {
          historial: [
            {
              nombre: 'María González López',
              email: 'maria.gonzalez@example.com',
              rut_destinatario: '98765432-1',
              banco: 'Banco de Chile',
              tipo_cuenta: 'Corriente',
              monto: 50000,
              fecha: '2024-02-08T15:30:00.000Z',
              _id: '507f1f77bcf86cd799439011',
            },
            {
              nombre: 'Pedro Ramírez Silva',
              email: 'pedro.ramirez@example.com',
              rut_destinatario: '11223344-5',
              banco: 'Banco Estado',
              tipo_cuenta: 'Vista',
              monto: 100000,
              fecha: '2024-02-07T10:15:00.000Z',
              _id: '507f1f77bcf86cd799439012',
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

    const transferencias = await this.transferenciasService.findByRut(rut);

    return {
      ok: true,
      body: {
        historial: transferencias,
      },
    };
  }
}
