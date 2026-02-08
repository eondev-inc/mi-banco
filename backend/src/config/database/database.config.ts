import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mi-banco',
  name: process.env.DB_NAME || 'mi-banco',
  options: {
    // Connection pool optimization
    maxPoolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    minPoolSize: 2,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: parseInt(
      process.env.DB_CONNECTION_TIMEOUT || '10000',
      10,
    ),
    socketTimeoutMS: 45000,

    // Performance settings
    autoIndex: process.env.NODE_ENV !== 'production',
    retryWrites: true,
    w: 'majority',
  },
}));
