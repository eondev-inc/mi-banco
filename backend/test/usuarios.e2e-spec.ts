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

  // We need real MongoDB ObjectIds for region and comuna.
  // These will be populated after querying /regiones in beforeAll,
  // or we seed them; for e2e we assume the seed has already run.
  let regionId: string;
  let comunaId: string;

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

    // Fetch a real regionId and comunaId from the seeded data
    const regResult = await app.inject({
      method: 'GET',
      url: '/regiones',
    });
    const regBody = JSON.parse(regResult.payload);
    if (regBody.ok && regBody.body.regiones.length > 0) {
      regionId = regBody.body.regiones[0]._id;

      const comResult = await app.inject({
        method: 'GET',
        url: `/regiones/${regionId}/comunas`,
      });
      const comBody = JSON.parse(comResult.payload);
      if (comBody.ok && comBody.body.comunas.length > 0) {
        comunaId = comBody.body.comunas[0]._id;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/usuario (POST)', () => {
    it('should create a new user', () => {
      const timestamp = Date.now();
      const newUser = {
        nombres: 'Test',
        apellidos: 'User E2E',
        email: `test${timestamp}@example.com`,
        emailConfirmacion: `test${timestamp}@example.com`,
        rut: `${String(timestamp).slice(-8)}-${timestamp % 10}`,
        telefono: '+56912345678',
        fechaNacimiento: '1990-01-01',
        direccion: 'Av. Test 1234',
        regionId,
        comunaId,
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
          expect(body.body.usuario).toHaveProperty('nombres', newUser.nombres);
          expect(body.body.usuario).toHaveProperty(
            'apellidos',
            newUser.apellidos,
          );
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
            nombres: 'Test',
            apellidos: 'User',
            email: 'invalid-email',
            emailConfirmacion: 'invalid-email',
            rut: '12345678-9',
            telefono: '+56912345678',
            fechaNacimiento: '1990-01-01',
            direccion: 'Av. Test 1234',
            regionId,
            comunaId,
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
            nombres: 'Test',
            apellidos: 'User',
            email: 'test@example.com',
            emailConfirmacion: 'test@example.com',
            rut: '12345678-9',
            telefono: '+56912345678',
            fechaNacimiento: '1990-01-01',
            direccion: 'Av. Test 1234',
            regionId,
            comunaId,
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
            nombres: 'Test',
            apellidos: 'User',
            email: 'test@example.com',
            emailConfirmacion: 'test@example.com',
            rut: '12345678', // Missing dash and verifier
            telefono: '+56912345678',
            fechaNacimiento: '1990-01-01',
            direccion: 'Av. Test 1234',
            regionId,
            comunaId,
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 for underage user', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: {
            nombres: 'Menor',
            apellidos: 'De Edad',
            email: `menor${Date.now()}@example.com`,
            emailConfirmacion: `menor${Date.now()}@example.com`,
            rut: '11111111-1',
            telefono: '+56912345678',
            fechaNacimiento: '2015-01-01', // Less than 18 years old
            direccion: 'Av. Test 1234',
            regionId,
            comunaId,
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 400 if emails do not match', () => {
      return app
        .inject({
          method: 'POST',
          url: '/usuario',
          payload: {
            nombres: 'Test',
            apellidos: 'User',
            email: 'test@example.com',
            emailConfirmacion: 'different@example.com',
            rut: '12345678-9',
            telefono: '+56912345678',
            fechaNacimiento: '1990-01-01',
            direccion: 'Av. Test 1234',
            regionId,
            comunaId,
            password: 'test123456',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
        });
    });

    it('should return 409 for duplicate email', () => {
      const duplicateUser = {
        nombres: 'Another',
        apellidos: 'User',
        email: createdUserEmail,
        emailConfirmacion: createdUserEmail,
        rut: '99999999-9',
        telefono: '+56912345678',
        fechaNacimiento: '1990-01-01',
        direccion: 'Av. Test 1234',
        regionId,
        comunaId,
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
      const uniqueEmail = `unique${Date.now()}@example.com`;
      const duplicateUser = {
        nombres: 'Another',
        apellidos: 'User',
        email: uniqueEmail,
        emailConfirmacion: uniqueEmail,
        rut: createdUserRut,
        telefono: '+56912345678',
        fechaNacimiento: '1990-01-01',
        direccion: 'Av. Test 1234',
        regionId,
        comunaId,
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
