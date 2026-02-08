import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Destinatarios (e2e)', () => {
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

    // Create a test user for destinatarios tests
    const timestamp = Date.now();
    const testUser = {
      nombre: 'Test User Destinatarios',
      email: `testdest${timestamp}@example.com`,
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

  describe('/cuentas (POST)', () => {
    it('should add a new destinatario', () => {
      const newDestinatario = {
        rut_cliente: testUserRut,
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        rut_destinatario: '11111111-1',
        telefono: '987654321',
        banco: 'Banco Chile',
        tipo_cuenta: 'Cuenta Corriente',
        numero_cuenta: 123456789,
      };

      return app
        .inject({
          method: 'POST',
          url: '/cuentas',
          payload: newDestinatario,
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
          url: '/cuentas',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro',
            apellido: 'González',
            email: 'invalid-email',
            rut_destinatario: '22222222-2',
            telefono: '987654321',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            numero_cuenta: 987654321,
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
          url: '/cuentas',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro',
            apellido: 'González',
            email: 'pedro@example.com',
            rut_destinatario: '12345678', // Missing dash and verifier
            telefono: '987654321',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            numero_cuenta: 987654321,
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
          url: '/cuentas',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro',
            // Missing apellido, email, etc.
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for invalid numero_cuenta (not a number)', () => {
      return app
        .inject({
          method: 'POST',
          url: '/cuentas',
          payload: {
            rut_cliente: testUserRut,
            nombre: 'Pedro',
            apellido: 'González',
            email: 'pedro2@example.com',
            rut_destinatario: '33333333-3',
            telefono: '987654321',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            numero_cuenta: 'not-a-number',
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
          url: '/cuentas',
          payload: {
            rut_cliente: '99999999-9',
            nombre: 'Pedro',
            apellido: 'González',
            email: 'pedro3@example.com',
            rut_destinatario: '44444444-4',
            telefono: '987654321',
            banco: 'Banco Estado',
            tipo_cuenta: 'Cuenta Vista',
            numero_cuenta: 987654321,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(404);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });

    it('should return 400 for duplicate destinatario', () => {
      const duplicateDestinatario = {
        rut_cliente: testUserRut,
        nombre: 'Juan Duplicate',
        apellido: 'Pérez Duplicate',
        email: 'juandup@example.com',
        rut_destinatario: '11111111-1', // Same as first destinatario
        telefono: '987654321',
        banco: 'Banco Chile',
        tipo_cuenta: 'Cuenta Corriente',
        numero_cuenta: 999999999,
      };

      return app
        .inject({
          method: 'POST',
          url: '/cuentas',
          payload: duplicateDestinatario,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });
  });

  describe('/cuentas (GET)', () => {
    it('should get destinatarios for a user', () => {
      return app
        .inject({
          method: 'GET',
          url: `/cuentas?rut=${testUserRut}`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body).toHaveProperty('destinatarios');
          expect(Array.isArray(body.body.destinatarios)).toBe(true);
          expect(body.body.destinatarios.length).toBeGreaterThan(0);
          expect(body.body.destinatarios[0]).toHaveProperty('nombre');
          expect(body.body.destinatarios[0]).toHaveProperty('rut_destinatario');
          expect(body.body.destinatarios[0]).toHaveProperty('banco');
        });
    });

    it('should return 404 for non-existent user', () => {
      return app
        .inject({
          method: 'GET',
          url: '/cuentas?rut=99999999-9',
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
          url: '/cuentas',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });
  });
});
