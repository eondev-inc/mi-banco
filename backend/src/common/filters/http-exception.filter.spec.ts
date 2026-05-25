import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockLogger: any;
  let mockResponse: Partial<FastifyReply>;
  let mockRequest: Partial<FastifyRequest>;

  beforeEach(async () => {
    mockLogger = {
      setContext: jest.fn(),
      error: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      method: 'POST',
      url: '/usuario',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HttpExceptionFilter,
        { provide: PinoLogger, useValue: mockLogger },
      ],
    }).compile();

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
  });

  function createMockHost(): ArgumentsHost {
    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  }

  describe('HttpException known', () => {
    it('should return correct status for OK (200)', () => {
      const exception = new HttpException('OK', HttpStatus.OK);
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return 400 for BadRequestException', () => {
      const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 for UnauthorizedException', () => {
      const exception = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for NotFoundException', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should return 409 for ConflictException', () => {
      const exception = new HttpException('Conflict', HttpStatus.CONFLICT);
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });

    it('should return 500 for InternalServerErrorException', () => {
      const exception = new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should log error with request context', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, createMockHost());

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'HTTP Exception',
          method: 'POST',
          url: '/usuario',
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Test error',
        }),
      );
    });
  });

  describe('non-HttpException (unknown errors)', () => {
    it('should return 500 status for generic Error', () => {
      const exception = new Error('Something went wrong');
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 500 status for plain object', () => {
      const exception = { message: 'plain object error' };
      filter.catch(exception as any, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return generic message for unknown errors', () => {
      const exception = new Error('Unexpected error');
      filter.catch(exception, createMockHost());

      expect(mockResponse.send).toHaveBeenCalledWith({
        ok: false,
        body: {
          message: 'Error interno del servidor',
          error: 'Unexpected error',
        },
      });
    });

    it('should log stack trace for unknown exceptions', () => {
      const exception = new Error('Database connection failed');
      filter.catch(exception, createMockHost());

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'HTTP Exception',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error interno del servidor',
          stack: expect.any(String),
        }),
      );
    });
  });

  describe('Response format', () => {
    it('should always return ok: false', () => {
      const exception = new HttpException('OK', HttpStatus.OK);
      filter.catch(exception, createMockHost());

      const sentResponse = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sentResponse.ok).toBe(false);
    });

    it('should include message and error in body', () => {
      const exception = new HttpException('Custom error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, createMockHost());

      const sentResponse = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sentResponse.body).toHaveProperty('message', 'Custom error');
      expect(sentResponse.body).toHaveProperty('error', 'Custom error');
    });

    it('should not log request body (security)', () => {
      const mockRequestWithBody = {
        ...mockRequest,
        body: { password: 'secret123', email: 'test@example.com' },
      } as any;

      const hostWithBody = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => mockRequestWithBody,
        }),
      } as unknown as ArgumentsHost;

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, hostWithBody);

      // Verify logger.error was called with an object that does NOT contain 'body'
      const loggedObject = (mockLogger.error as jest.Mock).mock.calls[0][0];
      expect(loggedObject).not.toHaveProperty('body');
    });
  });

  describe('Edge cases', () => {
    it('should handle HttpException with empty string message', () => {
      const exception = new HttpException('', HttpStatus.BAD_REQUEST);
      filter.catch(exception, createMockHost());

      const sentResponse = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sentResponse.body.message).toBe('');
    });

    it('should handle request without method or url', () => {
      const emptyRequest = {} as FastifyRequest;
      const host = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => emptyRequest,
        }),
      } as unknown as ArgumentsHost;

      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, host);

      // Should not throw, just log with undefined values
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle NotFoundException with constructor arg', () => {
      const exception = new NotFoundException('Usuario no encontrado');
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      const sentResponse = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sentResponse.body.message).toBe('Usuario no encontrado');
    });

    it('should handle BadRequestException with constructor arg', () => {
      const exception = new BadRequestException('Datos inválidos');
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      const sentResponse = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(sentResponse.body.message).toBe('Datos inválidos');
    });

    it('should handle UnauthorizedException with constructor arg', () => {
      const exception = new UnauthorizedException('No autorizado');
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    });

    it('should handle ConflictException with constructor arg', () => {
      const exception = new ConflictException('Recurso duplicado');
      filter.catch(exception, createMockHost());

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });
  });
});

// Import additional exceptions for edge case tests
import { NotFoundException, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';