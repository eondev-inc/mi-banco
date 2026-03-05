import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegionesController } from './regiones.controller';
import { RegionesService } from './regiones.service';
import { Region, RegionSchema } from './schemas/region.schema';
import { Comuna, ComunaSchema } from './schemas/comuna.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Region.name, schema: RegionSchema },
      { name: Comuna.name, schema: ComunaSchema },
    ]),
  ],
  controllers: [RegionesController],
  providers: [RegionesService],
  exports: [
    RegionesService,
    MongooseModule, // export so UsuariosModule can inject Region/Comuna models for validation
  ],
})
export class RegionesModule {}
