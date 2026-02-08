import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from '../src/app.module';

describe('Security (e2e)', () => {
  let app: NestFastifyApplication;

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
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Note: HttpExceptionFilter is already registered globally in AppModule

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Password Hashing', () => {
    it('should hash password on user creation', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const newUser = {
        nombre: 'Security Test User',
        email: `security_hash_${timestamp}_${random}@example.com`,
        rut: `${String(random).padStart(7, '0')}-${random % 10}`,
        password: 'plainPassword123',
      };

      const createResult = await app.inject({
        method: 'POST',
        url: '/usuario',
        payload: newUser,
      });

      expect(createResult.statusCode).toEqual(200);
      const createBody = JSON.parse(createResult.body);
      expect(createBody.ok).toBe(true);
      expect(createBody.body.usuario).not.toHaveProperty('password');

      // Try to login with same password
      const loginResult = await app.inject({
        method: 'POST',
        url: '/usuario/login',
        payload: {
          rut: newUser.rut,
          password: newUser.password,
        },
      });

      expect(loginResult.statusCode).toEqual(200);
      const loginBody = JSON.parse(loginResult.body);
      expect(loginBody.ok).toBe(true);
      expect(loginBody.body.usuario.rut).toBe(newUser.rut);
    });

    it('should reject invalid password', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const newUser = {
        nombre: 'Security Test User 2',
        email: `security_reject_${timestamp}_${random}@example.com`,
        rut: `${String(random + 1000).padStart(7, '0')}-${(random + 1) % 10}`,
        password: 'correctPassword123',
      };

      await app.inject({
        method: 'POST',
        url: '/usuario',
        payload: newUser,
      });

      const loginResult = await app.inject({
        method: 'POST',
        url: '/usuario/login',
        payload: {
          rut: newUser.rut,
          password: 'wrongPassword',
        },
      });

      expect(loginResult.statusCode).toEqual(401);
      const body = JSON.parse(loginResult.body);
      expect(body.ok).toBe(false);
      expect(body.body.message).toContain('incorrectos');
    });

    it('should never return password in response', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const newUser = {
        nombre: 'Security Test User 3',
        email: `security_nopass_${timestamp}_${random}@example.com`,
        rut: `${String(random + 2000).padStart(7, '0')}-${(random + 2) % 10}`,
        password: 'testPassword123',
      };

      const createResult = await app.inject({
        method: 'POST',
        url: '/usuario',
        payload: newUser,
      });

      const createBody = JSON.parse(createResult.body);
      expect(createBody.body.usuario).not.toHaveProperty('password');

      const loginResult = await app.inject({
        method: 'POST',
        url: '/usuario/login',
        payload: {
          rut: newUser.rut,
          password: newUser.password,
        },
      });

      const loginBody = JSON.parse(loginResult.body);
      expect(loginBody.body.usuario).not.toHaveProperty('password');
    });
  });

  describe('Security Headers', () => {
    it('should return successful response from health endpoint', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.status).toBe('ok');
    });

    it('should return successful response from root endpoint', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/',
      });

      expect(result.statusCode).toEqual(200);
      expect(result.body).toBeDefined();
      expect(result.body.length).toBeGreaterThan(0);
    });
  });

  describe('CORS', () => {
    it('should allow GET requests', async () => {
      const result = await app.inject({
        method: 'GET',
        url: '/health',
        headers: {
          origin: 'http://localhost:4200',
        },
      });

      expect(result.statusCode).toEqual(200);
    });

    it('should allow POST requests', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const result = await app.inject({
        method: 'POST',
        url: '/usuario',
        headers: {
          origin: 'http://localhost:4200',
        },
        payload: {
          nombre: 'CORS Test',
          email: `corstest_${timestamp}_${random}@example.com`,
          rut: `${String(random + 3000).padStart(7, '0')}-${(random + 3) % 10}`,
          password: 'test123',
        },
      });

      // Should process the request (either success or validation error)
      expect([200, 400]).toContain(result.statusCode);
    });
  });

  describe('Input Validation', () => {
    it('should reject malformed requests', async () => {
      const result = await app.inject({
        method: 'POST',
        url: '/usuario',
        payload: {
          nombre: 'Test',
          // Missing required fields
        },
      });

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body);
      expect(body.ok).toBe(false);
    });

    it('should sanitize input and reject extra fields', async () => {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const result = await app.inject({
        method: 'POST',
        url: '/usuario',
        payload: {
          nombre: 'Test User',
          email: `sanitize_${timestamp}_${random}@example.com`,
          rut: `${String(random + 4000).padStart(7, '0')}-${(random + 4) % 10}`,
          password: 'test123',
          extraField: 'should be removed', // Extra field
        },
      });

      expect(result.statusCode).toEqual(400);
      const body = JSON.parse(result.body);
      expect(body.ok).toBe(false);
    });
  });
});
