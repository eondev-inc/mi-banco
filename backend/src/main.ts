import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { runInCluster } from './cluster';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import compress from '@fastify/compress';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      // Performance optimizations
      trustProxy: true,
      requestIdLogLabel: 'reqId',
    }),
    { bufferLogs: true },
  );

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Register Helmet for security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

  // Register CORS with environment configuration
  await app.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Register Compression for response optimization
  await app.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate'],
    threshold: 1024, // Only compress responses > 1KB
  });

  // Register Rate Limiting
  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: process.env.RATE_LIMIT_WINDOW || '15 minutes',
    cache: 10000, // Cache size for rate limiting
    errorResponseBuilder: () => ({
      ok: false,
      body: {
        message: 'Demasiadas solicitudes, por favor intente más tarde',
        error: 'Too Many Requests',
      },
    }),
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Note: HttpExceptionFilter and LoggingInterceptor are registered globally in AppModule

  // Configure Swagger documentation (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Mi Banco API')
      .setDescription(
        'API REST para sistema bancario Mi Banco - Backend NestJS con Fastify y MongoDB',
      )
      .setVersion('1.0.0')
      .addTag('health', 'Health checks y estado del sistema')
      .addTag('usuarios', 'Gestión de usuarios y autenticación')
      .addTag('cuentas', 'Gestión de destinatarios/beneficiarios')
      .addTag('transferencias', 'Gestión de transferencias bancarias')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 8001;
  await app.listen(port, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(
      `Swagger documentation available at: ${await app.getUrl()}/api/docs`,
    );
  }
}

// Run with cluster in production for better performance
if (
  process.env.NODE_ENV === 'production' &&
  process.env.ENABLE_CLUSTER === 'true'
) {
  runInCluster(bootstrap);
} else {
  void bootstrap();
}
