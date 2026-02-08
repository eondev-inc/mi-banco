import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  async checkConnection(): Promise<boolean> {
    try {
      const state = this.connection.readyState;
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      return state === 1;
    } catch (error) {
      this.logger.error('Database connection check failed', error);
      return false;
    }
  }

  async getConnectionStatus(): Promise<{
    connected: boolean;
    state: string;
    host?: string;
    database?: string;
  }> {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const state = this.connection.readyState;

    return {
      connected: state === 1,
      state: states[state],
      host: this.connection.host,
      database: this.connection.name,
    };
  }
}
