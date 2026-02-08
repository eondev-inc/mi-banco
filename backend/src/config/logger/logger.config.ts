import { Params } from 'nestjs-pino';
import { IncomingMessage, ServerResponse } from 'http';

export const loggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              singleLine: false,
            },
          }
        : undefined,
    serializers: {
      req: (req: IncomingMessage & { id?: string }) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        // DO NOT log body - may contain passwords
      }),
      res: (res: ServerResponse) => ({
        statusCode: res.statusCode,
      }),
    },
    autoLogging: {
      ignore: (req: IncomingMessage) => req.url === '/health', // Don't log health checks
    },
    customLogLevel: (
      req: IncomingMessage,
      res: ServerResponse,
      err?: Error,
    ) => {
      if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
      if (res.statusCode >= 500 || err) return 'error';
      return 'info';
    },
  },
};
