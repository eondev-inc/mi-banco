import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Region } from './schemas/region.schema';
import { Comuna } from './schemas/comuna.schema';

@Injectable()
export class RegionesService {
  private readonly logger = new Logger(RegionesService.name);

  constructor(
    @InjectModel(Region.name) private readonly regionModel: Model<Region>,
    @InjectModel(Comuna.name) private readonly comunaModel: Model<Comuna>,
  ) {}

  /**
   * Returns all regions sorted by their ordinal position.
   * Results are cached at the DB level via lean() for performance.
   */
  async findAllRegiones(): Promise<Region[]> {
    this.logger.log('Fetching all regiones');

    const regiones = await this.regionModel
      .find()
      .select('_id nombre codigo ordinal cut')
      .sort({ cut: 1 })
      .lean()
      .exec();

    this.logger.log({ message: 'Regiones fetched', count: regiones.length });
    return regiones as Region[];
  }

  /**
   * Returns all comunas belonging to a given region.
   * Validates that the regionId is a valid ObjectId and that
   * the region actually exists before querying comunas.
   */
  async findComunasByRegion(regionId: string): Promise<Comuna[]> {
    this.logger.log({ message: 'Fetching comunas for region', regionId });

    if (!Types.ObjectId.isValid(regionId)) {
      throw new NotFoundException(`Region con id '${regionId}' no encontrada`);
    }

    const regionExists = await this.regionModel
      .exists({ _id: regionId })
      .lean()
      .exec();

    if (!regionExists) {
      throw new NotFoundException(`Region con id '${regionId}' no encontrada`);
    }

    const comunas = await this.comunaModel
      .find({ regionId: new Types.ObjectId(regionId) })
      .select('_id nombre regionId')
      .sort({ nombre: 1 })
      .lean()
      .exec();

    this.logger.log({
      message: 'Comunas fetched',
      regionId,
      count: comunas.length,
    });

    return comunas as Comuna[];
  }
}
