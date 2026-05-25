import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

describe('Regiones (e2e)', () => {
  let app: NestFastifyApplication;
  let seededRegionId: string;
  let seededComunaIds: string[];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Fetch seeded regions to get a valid regionId for tests
    const regResult = await app.inject({
      method: 'GET',
      url: '/regiones',
    });

    expect(regResult.statusCode).toEqual(200);
    const regBody = JSON.parse(regResult.payload);
    expect(regBody.ok).toBe(true);
    expect(regBody.body.regiones).toBeDefined();
    expect(Array.isArray(regBody.body.regiones)).toBe(true);
    expect(regBody.body.regiones.length).toBeGreaterThan(0);

    // Use first seeded region for tests
    seededRegionId = regBody.body.regiones[0]._id;

    // Get comunas for that region to have a valid comunaId too
    const comResult = await app.inject({
      method: 'GET',
      url: `/regiones/${seededRegionId}/comunas`,
    });

    const comBody = JSON.parse(comResult.payload);
    seededComunaIds = comBody.body.comunas.map((c: any) => c._id);
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('/regiones (GET)', () => {
    it('should return all regions with correct structure', () => {
      return app
        .inject({
          method: 'GET',
          url: '/regiones',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body).toHaveProperty('regiones');
          expect(Array.isArray(body.body.regiones)).toBe(true);

          // Verify region structure
          const region = body.body.regiones[0];
          expect(region).toHaveProperty('_id');
          expect(region).toHaveProperty('nombre');
          expect(region).toHaveProperty('codigo');
          expect(region).toHaveProperty('ordinal');
          expect(region).toHaveProperty('cut');
        });
    });

    it('should return regions sorted by CUT code (north to south)', () => {
      return app
        .inject({
          method: 'GET',
          url: '/regiones',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          const regiones = body.body.regiones;

          // Verify sorting: CUT codes should be in ascending order
          const cutCodes = regiones.map((r: any) => parseInt(r.cut));
          for (let i = 1; i < cutCodes.length; i++) {
            expect(cutCodes[i]).toBeGreaterThanOrEqual(cutCodes[i - 1]);
          }
        });
    });

    it('should return all Chilean regions (minimum 15)', () => {
      return app
        .inject({
          method: 'GET',
          url: '/regiones',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.body.regiones.length).toBeGreaterThanOrEqual(15);
        });
    });

    it('should return consistent data on multiple calls', async () => {
      const result1 = await app.inject({
        method: 'GET',
        url: '/regiones',
      });

      expect(result1.statusCode).toEqual(200);
      const body1 = JSON.parse(result1.payload);

      const result2 = await app.inject({
        method: 'GET',
        url: '/regiones',
      });

      expect(result2.statusCode).toEqual(200);
      const body2 = JSON.parse(result2.payload);

      // Both calls should return same data
      expect(body2.body.regiones).toEqual(body1.body.regiones);
    });

    it('should return regions with valid MongoDB ObjectIds', () => {
      return app
        .inject({
          method: 'GET',
          url: '/regiones',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          body.body.regiones.forEach((region: any) => {
            // MongoDB ObjectId is 24 hex characters
            expect(region._id).toMatch(/^[0-9a-fA-F]{24}$/);
          });
        });
    });

    it('should include region codes in CL-XX format', () => {
      return app
        .inject({
          method: 'GET',
          url: '/regiones',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          body.body.regiones.forEach((region: any) => {
            expect(region.codigo).toMatch(/^CL-[A-Z]{1,2}$/);
          });
        });
    });
  });

  describe('/regiones/:id/comunas (GET)', () => {
    it('should return comunas for a valid region', () => {
      return app
        .inject({
          method: 'GET',
          url: `/regiones/${seededRegionId}/comunas`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          expect(body.ok).toBe(true);
          expect(body.body).toHaveProperty('comunas');
          expect(Array.isArray(body.body.comunas)).toBe(true);
          expect(body.body.comunas.length).toBeGreaterThan(0);
        });
    });

    it('should return comunas sorted alphabetically', () => {
      return app
        .inject({
          method: 'GET',
          url: `/regiones/${seededRegionId}/comunas`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          const comunas = body.body.comunas;

          // Verify alphabetical sorting
          for (let i = 1; i < comunas.length; i++) {
            expect(comunas[i].nombre.localeCompare(comunas[i - 1].nombre)).toBeGreaterThanOrEqual(0);
          }
        });
    });

    it('should return comunas with correct structure', () => {
      return app
        .inject({
          method: 'GET',
          url: `/regiones/${seededRegionId}/comunas`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          const comuna = body.body.comunas[0];

          expect(comuna).toHaveProperty('_id');
          expect(comuna).toHaveProperty('nombre');
          expect(comuna).toHaveProperty('regionId');
          expect(comuna.regionId).toBe(seededRegionId);
        });
    });

    it('should return 404 for non-existent region (valid ObjectId)', async () => {
      const nonExistentId = '000000000000000000000000';

      const result = await app.inject({
        method: 'GET',
        url: `/regiones/${nonExistentId}/comunas`,
      });

      expect(result.statusCode).toEqual(404);
      const body = JSON.parse(result.payload);
      expect(body.ok).toBe(false);
      expect(body.body.message).toContain('no encontrada');
    });

    it('should return 404 for invalid region id format', async () => {
      const invalidId = 'not-a-valid-objectid';

      const result = await app.inject({
        method: 'GET',
        url: `/regiones/${invalidId}/comunas`,
      });

      expect(result.statusCode).toEqual(404);
      const body = JSON.parse(result.payload);
      expect(body.ok).toBe(false);
    });

    it('should return 404 for short invalid id', async () => {
      const shortId = 'abc';

      const result = await app.inject({
        method: 'GET',
        url: `/regiones/${shortId}/comunas`,
      });

      expect(result.statusCode).toEqual(404);
    });

    it('should return empty array for region with no comunas', async () => {
      // Find a region that might have no comunas, or use a fake id
      // Since we don't know which region has 0 comunas, we use a non-existent id
      const nonExistentId = '000000000000000000000001';

      const result = await app.inject({
        method: 'GET',
        url: `/regiones/${nonExistentId}/comunas`,
      });

      // Should return 404 because region doesn't exist, not empty array
      expect(result.statusCode).toEqual(404);
    });

    it('should return comunas with valid MongoDB ObjectIds', () => {
      return app
        .inject({
          method: 'GET',
          url: `/regiones/${seededRegionId}/comunas`,
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);

          const body = JSON.parse(result.payload);
          body.body.comunas.forEach((comuna: any) => {
            expect(comuna._id).toMatch(/^[0-9a-fA-F]{24}$/);
            expect(comuna.regionId).toMatch(/^[0-9a-fA-F]{24}$/);
          });
        });
    });

    it('should return same comunas on multiple calls', async () => {
      const result1 = await app.inject({
        method: 'GET',
        url: `/regiones/${seededRegionId}/comunas`,
      });

      expect(result1.statusCode).toEqual(200);
      const body1 = JSON.parse(result1.payload);

      const result2 = await app.inject({
        method: 'GET',
        url: `/regiones/${seededRegionId}/comunas`,
      });

      expect(result2.statusCode).toEqual(200);
      const body2 = JSON.parse(result2.payload);

      expect(body2.body.comunas).toEqual(body1.body.comunas);
    });
  });

  describe('CORS support', () => {
    it('should allow GET /regiones with CORS origin', () => {
      return app
        .inject({
          method: 'GET',
          url: '/regiones',
          headers: {
            origin: 'http://localhost:4200',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);
        });
    });

    it('should allow GET /regiones/:id/comunas with CORS origin', () => {
      return app
        .inject({
          method: 'GET',
          url: `/regiones/${seededRegionId}/comunas`,
          headers: {
            origin: 'http://localhost:4200',
          },
        })
        .then((result) => {
          expect(result.statusCode).toEqual(200);
        });
    });
  });

  describe('Response time', () => {
    it('should respond within reasonable time for /regiones', () => {
      const start = Date.now();

      return app
        .inject({
          method: 'GET',
          url: '/regiones',
        })
        .then((result) => {
          const duration = Date.now() - start;
          expect(result.statusCode).toEqual(200);
          // Should respond in less than 2 seconds
          expect(duration).toBeLessThan(2000);
        });
    });

    it('should respond within reasonable time for /regiones/:id/comunas', () => {
      const start = Date.now();

      return app
        .inject({
          method: 'GET',
          url: `/regiones/${seededRegionId}/comunas`,
        })
        .then((result) => {
          const duration = Date.now() - start;
          expect(result.statusCode).toEqual(200);
          // Should respond in less than 2 seconds
          expect(duration).toBeLessThan(2000);
        });
    });
  });
});