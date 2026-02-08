import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { DatabaseHealthService } from './database-health.service';

describe('DatabaseHealthService', () => {
  let service: DatabaseHealthService;
  let mockConnection: any;

  beforeEach(async () => {
    mockConnection = {
      readyState: 1,
      host: 'localhost',
      name: 'mi-banco',
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseHealthService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<DatabaseHealthService>(DatabaseHealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return true when connected', async () => {
    mockConnection.readyState = 1;
    const result = await service.checkConnection();
    expect(result).toBe(true);
  });

  it('should return false when disconnected', async () => {
    mockConnection.readyState = 0;
    const result = await service.checkConnection();
    expect(result).toBe(false);
  });

  it('should return connection status', async () => {
    const status = await service.getConnectionStatus();

    expect(status).toHaveProperty('connected');
    expect(status).toHaveProperty('state');
    expect(status).toHaveProperty('host');
    expect(status).toHaveProperty('database');
  });
});
