import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PinoLogger } from 'nestjs-pino';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HttpExceptionFilter.name);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Error interno del servidor';

    const errorResponse = {
      ok: false,
      body: {
        message,
        error: exception?.response?.message || exception?.message || message,
      },
    };

    // Structured error logging with full context
    this.logger.error({
      message: 'HTTP Exception',
      method: request.method,
      url: request.url,
      statusCode: status,
      error: message,
      errorDetails: exception?.response?.message || exception?.message,
      stack: exception.stack,
      // DO NOT log request body - may contain passwords
    });

    response.status(status).send(errorResponse);
  }
}
