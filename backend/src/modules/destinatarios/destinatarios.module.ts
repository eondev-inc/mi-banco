import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DestinatariosController } from './destinatarios.controller';
import { DestinatariosService } from './destinatarios.service';
import { User, UserSchema } from '../usuarios/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [DestinatariosController],
  providers: [DestinatariosService],
  exports: [DestinatariosService],
})
export class DestinatariosModule {}
