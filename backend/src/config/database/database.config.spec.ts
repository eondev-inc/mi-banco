import databaseConfig from './database.config';

describe('DatabaseConfig', () => {
  it('should return database configuration', () => {
    const config = databaseConfig();

    expect(config).toHaveProperty('uri');
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('options');
  });

  it('should have valid default values', () => {
    const config = databaseConfig();

    expect(config.uri).toBeDefined();
    expect(config.name).toBe('mi-banco');
    expect(config.options.maxPoolSize).toBeGreaterThan(0);
  });
});
