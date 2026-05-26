import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggingInterceptor],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  function createMockExecutionContext(method: string, url: string): ExecutionContext {
    const mockRequest = { method, url };
    const mockResponse = { statusCode: 200 };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
      getClass: () => ({}),
      getHandler: () => ({}),
      getArgs: () => [],
      getArgByIndex: () => undefined,
      switchToRpc: () => ({}) as any,
      switchToWs: () => ({}) as any,
      getType: () => 'http',
    } as unknown as ExecutionContext;
  }

  function createMockCallHandler(returnValue: any = {}): CallHandler {
    return {
      handle: () => of(returnValue),
    };
  }

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('basic interception', () => {
    it('should call next.handle() and return Observable', () => {
      const context = createMockExecutionContext('GET', '/usuarios');
      const next = createMockCallHandler({ data: 'test' });

      const result = interceptor.intercept(context, next);

      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });

    it('should return Observable that emits the handler value', (done) => {
      const context = createMockExecutionContext('GET', '/usuarios');
      const mockData = { id: 1, name: 'Test' };
      const next = createMockCallHandler(mockData);

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(value).toEqual(mockData);
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    methods.forEach((method) => {
      it(`should handle ${method} requests without throwing`, () => {
        const context = createMockExecutionContext(method, `/${method.toLowerCase()}`);
        const next = createMockCallHandler();

        expect(() => interceptor.intercept(context, next)).not.toThrow();
      });
    });

    methods.forEach((method) => {
      it(`should return valid Observable for ${method}`, (done) => {
        const context = createMockExecutionContext(method, `/${method.toLowerCase()}`);
        const next = createMockCallHandler({ success: true });

        interceptor.intercept(context, next).subscribe({
          next: (value) => {
            expect(value).toEqual({ success: true });
            done();
          },
          error: done.fail,
        });
      });
    });
  });

  describe('different URLs', () => {
    const urls = [
      '/usuarios',
      '/usuarios/123',
      '/transferencias',
      '/cuentas',
      '/health',
      '/api/nested/path',
    ];

    urls.forEach((url) => {
      it(`should handle URL: ${url}`, (done) => {
        const context = createMockExecutionContext('GET', url);
        const next = createMockCallHandler({});

        interceptor.intercept(context, next).subscribe({
          next: () => done(),
          error: done.fail,
        });
      });
    });
  });

  describe('error handling', () => {
    it('should handle context without throwing', () => {
      const mockRequest = { method: 'POST' };
      const mockResponse = { statusCode: 200 };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const next = createMockCallHandler({});

      expect(() => interceptor.intercept(context, next)).not.toThrow();
    });

    it('should handle empty response object', (done) => {
      const context = createMockExecutionContext('GET', '/empty');
      const next = createMockCallHandler({});

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(value).toEqual({});
          done();
        },
        error: done.fail,
      });
    });

    it('should handle null response', (done) => {
      const context = createMockExecutionContext('GET', '/null');
      const next = createMockCallHandler(null);

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(value).toBeNull();
          done();
        },
        error: done.fail,
      });
    });

    it('should handle array response', (done) => {
      const context = createMockExecutionContext('GET', '/array');
      const next = createMockCallHandler([1, 2, 3]);

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(Array.isArray(value)).toBe(true);
          expect(value).toEqual([1, 2, 3]);
          done();
        },
        error: done.fail,
      });
    });
  });

  describe('response body types', () => {
    it('should handle array response', (done) => {
      const context = createMockExecutionContext('GET', '/list');
      const next = createMockCallHandler([1, 2, 3]);

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(Array.isArray(value)).toBe(true);
          expect(value).toEqual([1, 2, 3]);
          done();
        },
        error: done.fail,
      });
    });

    it('should handle object response', (done) => {
      const context = createMockExecutionContext('GET', '/object');
      const next = createMockCallHandler({ nested: { data: 'value' } });

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(value).toEqual({ nested: { data: 'value' } });
          done();
        },
        error: done.fail,
      });
    });

    it('should handle number response', (done) => {
      const context = createMockExecutionContext('GET', '/number');
      const next = createMockCallHandler(42);

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(value).toBe(42);
          done();
        },
        error: done.fail,
      });
    });

    it('should handle string response', (done) => {
      const context = createMockExecutionContext('GET', '/string');
      const next = createMockCallHandler('hello');

      interceptor.intercept(context, next).subscribe({
        next: (value) => {
          expect(value).toBe('hello');
          done();
        },
        error: done.fail,
      });
    });
  });
});