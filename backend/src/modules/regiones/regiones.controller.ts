import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RegionesService } from './regiones.service';

@ApiTags('regiones')
@Controller('regiones')
export class RegionesController {
  constructor(private readonly regionesService: RegionesService) {}

  /**
   * GET /regiones
   * Returns all Chilean regions sorted by CUT code (north to south).
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todas las regiones de Chile' })
  @ApiResponse({
    status: 200,
    description: 'Listado de regiones ordenadas de norte a sur.',
    schema: {
      example: {
        ok: true,
        body: {
          regiones: [
            {
              _id: '64a1b2c3d4e5f6a7b8c9d0e1',
              nombre: 'Arica y Parinacota',
              codigo: 'CL-AP',
              ordinal: 'XV',
              cut: '15',
            },
          ],
        },
      },
    },
  })
  async findAll() {
    const regiones = await this.regionesService.findAllRegiones();
    return { ok: true, body: { regiones } };
  }

  /**
   * GET /regiones/:id/comunas
   * Returns all comunas for a given region, sorted alphabetically.
   */
  @Get(':id/comunas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener comunas de una región',
    description:
      'Retorna todas las comunas de la región indicada, ordenadas alfabéticamente.',
  })
  @ApiParam({
    name: 'id',
    description: 'MongoDB ObjectId de la región',
    example: '64a1b2c3d4e5f6a7b8c9d0e1',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de comunas de la región, orden alfabético.',
    schema: {
      example: {
        ok: true,
        body: {
          comunas: [
            {
              _id: '64a1b2c3d4e5f6a7b8c9d0e2',
              nombre: 'Arica',
              regionId: '64a1b2c3d4e5f6a7b8c9d0e1',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Región no encontrada.',
    schema: {
      example: {
        ok: false,
        body: {
          message: "Region con id '...' no encontrada",
          error: 'Not Found',
        },
      },
    },
  })
  async findComunas(@Param('id') id: string) {
    const comunas = await this.regionesService.findComunasByRegion(id);
    return { ok: true, body: { comunas } };
  }
}
