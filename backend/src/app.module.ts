import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database/database.module';
import { DatabaseHealthService } from './config/database/database-health.service';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { DestinatariosModule } from './modules/destinatarios/destinatarios.module';
import { TransferenciasModule } from './modules/transferencias/transferencias.module';
import databaseConfig from './config/database/database.config';
import { loggerConfig } from './config/logger/logger.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    LoggerModule.forRoot(loggerConfig),
    DatabaseModule,
    UsuariosModule,
    DestinatariosModule,
    TransferenciasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseHealthService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
