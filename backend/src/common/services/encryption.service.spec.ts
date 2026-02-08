import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[ab]\$/); // bcrypt hash format
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
      expect(hash1).toBeDefined();
      expect(hash2).toBeDefined();
    });

    it('should hash empty string', async () => {
      const password = '';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should hash long password', async () => {
      const password = 'a'.repeat(100);
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('comparePassword', () => {
    it('should return true for valid password', async () => {
      const password = 'testPassword123';
      const hash = await service.hashPassword(password);
      const isValid = await service.comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await service.hashPassword(password);
      const isValid = await service.comparePassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'testPassword123';
      const hash = await service.hashPassword(password);
      const isValid = await service.comparePassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await service.hashPassword(password);
      const isValid = await service.comparePassword('testpassword123', hash);

      expect(isValid).toBe(false);
    });

    it('should handle special characters', async () => {
      const password = 'P@ssw0rd!#$%&*()';
      const hash = await service.hashPassword(password);
      const isValid = await service.comparePassword(password, hash);

      expect(isValid).toBe(true);
    });
  });
});
