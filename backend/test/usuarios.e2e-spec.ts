import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Usuarios (e2e)', () => {
  let app: NestFastifyApplication;
  let createdUserRut: string;
  let createdUserEmail: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/usuario (POST)', () => {
    it('should create a new user', () => {
      const timestamp = Date.now();
      const newUser = {
        nombre: 'Test User E2E',
        email: `test${timestamp}@example.com`,
        rut: `${String(timestamp).slice(-8)}-${timestamp % 10}`,
        password: 'test123456',
      };

      createdUserRut = newUser.rut;
      createdUserEmail = newUser.email;

      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: newUser,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body.usuario).toHaveProperty('nombre', newUser.nombre);
          expect(body.body.usuario).toHaveProperty('email', newUser.email);
          expect(body.body.usuario).toHaveProperty('rut', newUser.rut);
          expect(body.body.usuario).not.toHaveProperty('password');
          expect(body.body.usuario).toHaveProperty('destinatarios');
          expect(body.body.usuario).toHaveProperty('transferencia');
        });
    });

    it('should return 400 for invalid email', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: {
            nombre: 'Test',
            email: 'invalid-email',
            rut: '12345678-9',
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for short password', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: {
            nombre: 'Test',
            email: 'test@example.com',
            rut: '12345678-9',
            password: '123',
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
          url: '/usuario',
          payload: {
            nombre: 'Test',
            email: 'test@example.com',
            rut: '12345678', // Missing dash and verifier
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 409 for duplicate email', () => {
      const duplicateUser = {
        nombre: 'Another User',
        email: createdUserEmail,
        rut: '99999999-9',
        password: 'test123456',
      };

      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: duplicateUser,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(409);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });

    it('should return 409 for duplicate RUT', () => {
      const duplicateUser = {
        nombre: 'Another User',
        email: `unique${Date.now()}@example.com`,
        rut: createdUserRut,
        password: 'test123456',
      };

      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: duplicateUser,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(409);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });
  });

  describe('/usuario/login (POST)', () => {
    it('should login with valid credentials', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario/login',
          payload: {
            rut: createdUserRut,
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body.usuario).toHaveProperty('rut', createdUserRut);
          expect(body.body.usuario).toHaveProperty('email', createdUserEmail);
          expect(body.body.usuario).not.toHaveProperty('password');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario/login',
          payload: {
            rut: '12345678-9',
            password: 'wrongpassword',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });

    it('should return 400 if rut is missing', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario/login',
          payload: {
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });

    it('should return 400 if password is missing', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario/login',
          payload: {
            rut: createdUserRut,
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });

    it('should return 400 if both rut and password are missing', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario/login',
          payload: {},
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(false);
        });
    });
  });
});
