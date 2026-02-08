import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { User } from './schemas/user.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { EncryptionService } from '@/common/services/encryption.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let mockUserModel: any;
  let mockEncryptionService: any;

  const mockUserData = {
    nombre: 'Test User',
    email: 'test@example.com',
    rut: '12345678-9',
    password: '$2b$10$hashedPassword', // Simulated bcrypt hash
    destinatarios: [],
    transferencia: [],
  };

  beforeEach(async () => {
    // Mock del modelo de Mongoose with chainable methods
    const mockSave = jest.fn().mockResolvedValue(mockUserData);
    const mockExec = jest.fn();
    const mockLean = jest.fn(() => ({ exec: mockExec }));
    const mockSelect = jest.fn(() => ({ lean: mockLean, exec: mockExec }));

    mockUserModel = jest.fn().mockImplementation(() => ({
      ...mockUserData,
      save: mockSave,
    }));
    mockUserModel.findOne = jest.fn().mockReturnValue({
      select: mockSelect,
      lean: mockLean,
      exec: mockExec,
    });
    mockUserModel._mockChain = {
      exec: mockExec,
      lean: mockLean,
      select: mockSelect,
    };

    // Mock del EncryptionService
    mockEncryptionService = {
      hashPassword: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: EncryptionService,
          useValue: mockEncryptionService,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUsuarioDto = {
      nombre: 'Test User',
      email: 'test@example.com',
      rut: '12345678-9',
      password: 'test123',
    };

    it('should create a new user successfully', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue(null);

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('nombre', createUserDto.nombre);
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result).toHaveProperty('rut', createUserDto.rut);
      expect(result).not.toHaveProperty('password');
      expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        $or: [{ email: createUserDto.email }, { rut: createUserDto.rut }],
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        email: createUserDto.email,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('El email ya está registrado'),
      );
    });

    it('should throw ConflictException if rut already exists', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        rut: createUserDto.rut,
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('El RUT ya está registrado'),
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginUsuarioDto = {
      rut: '12345678-9',
      password: 'test123',
    };

    it('should login user successfully', async () => {
      const mockChain = {
        select: jest.fn().mockResolvedValue(mockUserData),
      };
      mockUserModel.findOne.mockReturnValue(mockChain);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('nombre', mockUserData.nombre);
      expect(result).toHaveProperty('rut', mockUserData.rut);
      expect(result).not.toHaveProperty('password');
      expect(mockEncryptionService.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUserData.password,
      );
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ rut: loginDto.rut });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const mockChain = {
        select: jest.fn().mockResolvedValue(null),
      };
      mockUserModel.findOne.mockReturnValue(mockChain);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('RUT o contraseña incorrectos'),
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockChain = {
        select: jest.fn().mockResolvedValue(mockUserData),
      };
      mockUserModel.findOne.mockReturnValue(mockChain);
      mockEncryptionService.comparePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('RUT o contraseña incorrectos'),
      );
    });
  });

  describe('findByRut', () => {
    it('should find user by rut', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUserData);

      const result = await service.findByRut('12345678-9');

      expect(result).toEqual(mockUserData);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ rut: '12345678-9' });
    });

    it('should return null if user not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      const result = await service.findByRut('99999999-9');

      expect(result).toBeNull();
    });
  });
});
