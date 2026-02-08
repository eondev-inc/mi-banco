import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;

        this.logger.log({
          method,
          url,
          statusCode: response.statusCode,
          responseTime: `${delay}ms`,
        });

        // Warn if response is slow (> 1 second)
        if (delay > 1000) {
          this.logger.warn({
            message: 'Slow response detected',
            method,
            url,
            responseTime: `${delay}ms`,
          });
        }
      }),
    );
  }
}
