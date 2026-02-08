import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Transferencias (e2e)', () => {
  let app: NestFastifyApplication;
  let testUserRut: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Note: HttpExceptionFilter is already registered globally in AppModule

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Create a test user for transferencias tests
    const timestamp = Date.now();
    const testUser = {
      nombre: 'Test User Transferencias',
      email: `testtrans${timestamp}@example.com`,
      rut: `${String(timestamp).slice(-8)}-${timestamp % 10}`,
      password: 'test123456',
    };

    testUserRut = testUser.rut;

    await app.inject({
      method: 'POST',
      url: '/usuario',
      payload: testUser,
    });
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('/transferencias (POST)', () => {
    it('should create a new transferencia', () => {
      const newTransferencia = {
        rut_cliente: testUserRut,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        rut_destinatario: '11111111-1',
        banco: 'Banco Chile',
        tipo_cuenta: 'Cuenta Corriente',
        monto: 50000,
      };

      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: newTransferencia,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body).toHaveProperty('message');
          expect(body.body).toHaveProperty('created', true);
        });
    });

    it('should return 400 for invalid email format', () => {
      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro González',
            email: 'invalid-email',
            rut_destinatario: '22222222-2',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            monto: 75000,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for invalid RUT format', () => {
      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro González',
            email: 'pedro@example.com',
            rut_destinatario: '12345678', // Missing dash and verifier
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            monto: 75000,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for missing required fields', () => {
      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro',
            // Missing email, rut_destinatario, etc.
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for invalid monto (not a number)', () => {
      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro González',
            email: 'pedro2@example.com',
            rut_destinatario: '33333333-3',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            monto: 'not-a-number',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for monto less than 1', () => {
      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro González',
            email: 'pedro3@example.com',
            rut_destinatario: '44444444-4',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            monto: 0,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 404 for non-existent user', () => {
      return app
        .inject({
          method: 'POST',
          url: '/transferencias',
          payload: {
            rut_cliente: '99999999-9',
            nombre: 'Pedro González',
            email: 'pedro4@example.com',
            rut_destinatario: '55555555-5',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            monto: 100000,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(404);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });
  });

  describe('/transferencias (GET)', () => {
    it('should get transferencias for a user', () => {
      return app
        .inject({
          method: 'GET',
          url: `/transferencias?rut=${testUserRut}`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body).toHaveProperty('historial');
          expect(Array.isArray(body.body.historial)).toBe(true);
          expect(body.body.historial.length).toBeGreaterThan(0);
          expect(body.body.historial[0]).toHaveProperty('nombre');
          expect(body.body.historial[0]).toHaveProperty('monto');
          expect(body.body.historial[0]).toHaveProperty('fecha');
        });
    });

    it('should return 404 for non-existent user', () => {
      return app
        .inject({
          method: 'GET',
          url: '/transferencias?rut=99999999-9',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(404);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });

    it('should return 400 if rut is missing', () => {
      return app
        .inject({
          method: 'GET',
          url: '/transferencias',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });
  });
});
