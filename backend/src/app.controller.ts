import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { DatabaseHealthService } from './config/database/database-health.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida' })
  @ApiResponse({
    status: 200,
    description: 'Retorna un mensaje de bienvenida',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Verificar estado del sistema y conexión a base de datos',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado del sistema y conexión a MongoDB',
    schema: {
      example: {
        status: 'ok',
        database: {
          connected: true,
          state: 'connected',
          host: 'localhost:27017',
          name: 'mi-banco',
        },
        timestamp: '2024-02-08T15:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Error en la conexión a la base de datos',
    schema: {
      example: {
        status: 'error',
        database: {
          connected: false,
          state: 'disconnected',
          host: 'localhost:27017',
          name: 'mi-banco',
        },
        timestamp: '2024-02-08T15:30:00.000Z',
      },
    },
  })
  async getHealth() {
    const dbStatus = await this.databaseHealthService.getConnectionStatus();

    return {
      status: dbStatus.connected ? 'ok' : 'error',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
