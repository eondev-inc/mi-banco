import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';

describe('Health Check (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET) - should return health status', () => {
    return app
      .inject({
        method: 'GET',
        url: '/health',
      })
      .then((result) => {
        expect(result.statusCode).toEqual(200);

        const body = JSON.parse(result.payload);
        expect(body).toHaveProperty('status');
        expect(body).toHaveProperty('database');
        expect(body).toHaveProperty('timestamp');
        expect(body.database).toHaveProperty('connected');
        expect(body.database).toHaveProperty('state');
      });
  });
});
