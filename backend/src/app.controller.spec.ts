import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseHealthService } from './config/database/database-health.service';

describe('AppController', () => {
  let appController: AppController;

  const mockDatabaseHealthService = {
    getConnectionStatus: jest.fn().mockResolvedValue({
      connected: true,
      state: 'connected',
      host: 'localhost',
      database: 'mi-banco',
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: DatabaseHealthService,
          useValue: mockDatabaseHealthService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return health status with database info', async () => {
      const result = await appController.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('database');
      expect(result).toHaveProperty('timestamp');
      expect(result.database).toEqual({
        connected: true,
        state: 'connected',
        host: 'localhost',
        database: 'mi-banco',
      });
      expect(mockDatabaseHealthService.getConnectionStatus).toHaveBeenCalled();
    });
  });
});
