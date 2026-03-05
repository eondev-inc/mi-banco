import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { UsuariosService } from './usuarios.service';
import { User } from './schemas/user.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { EncryptionService } from '@/common/services/encryption.service';
import { Region } from '@modules/regiones/schemas/region.schema';
import { Comuna } from '@modules/regiones/schemas/comuna.schema';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let mockUserModel: any;
  let mockRegionModel: any;
  let mockComunaModel: any;
  let mockEncryptionService: any;

  const mockRegionId = new Types.ObjectId().toHexString();
  const mockComunaId = new Types.ObjectId().toHexString();

  const mockUserData = {
    nombres: 'Juan Carlos',
    apellidos: 'Pérez González',
    nombreCompleto: 'Juan Carlos Pérez González',
    email: 'test@example.com',
    rut: '12345678-9',
    password: '$2b$10$hashedPassword', // Simulated bcrypt hash
    telefono: '+56912345678',
    fechaNacimiento: new Date('1990-05-15'),
    direccion: 'Av. Test 1234',
    regionId: new Types.ObjectId(mockRegionId),
    comunaId: new Types.ObjectId(mockComunaId),
    destinatarios: [],
    transferencia: [],
  };

  /** Helper: builds a query chain mock: .select().lean().exec() */
  function makeQueryChain(resolvedValue: any) {
    const exec = jest.fn().mockResolvedValue(resolvedValue);
    const lean = jest.fn(() => ({ exec }));
    const select = jest.fn(() => ({ lean, exec }));
    return { select, lean, exec };
  }

  beforeEach(async () => {
    // Mock del modelo de Usuario with chainable methods
    const mockSave = jest.fn().mockResolvedValue(mockUserData);

    mockUserModel = jest.fn().mockImplementation(() => ({
      ...mockUserData,
      save: mockSave,
    }));

    // Default: no existing user (exec returns null)
    const defaultChain = makeQueryChain(null);
    mockUserModel.findOne = jest.fn().mockReturnValue(defaultChain);
    mockUserModel._mockChain = defaultChain;

    // Region model: findById returns a chain that resolves to a region object
    mockRegionModel = {
      findById: jest
        .fn()
        .mockReturnValue(makeQueryChain({ _id: mockRegionId })),
    };

    // Comuna model: findOne returns a chain that resolves to a comuna object
    mockComunaModel = {
      findOne: jest.fn().mockReturnValue(makeQueryChain({ _id: mockComunaId })),
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
          provide: getModelToken(Region.name),
          useValue: mockRegionModel,
        },
        {
          provide: getModelToken(Comuna.name),
          useValue: mockComunaModel,
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
      nombres: 'Juan Carlos',
      apellidos: 'Pérez González',
      email: 'test@example.com',
      emailConfirmacion: 'test@example.com',
      rut: '12345678-9',
      telefono: '+56912345678',
      fechaNacimiento: '1990-05-15',
      direccion: 'Av. Test 1234',
      regionId: mockRegionId,
      comunaId: mockComunaId,
      password: 'test123',
    };

    it('should create a new user successfully', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue(null);

      const result = await service.create(createUserDto);

      expect(result).toHaveProperty('nombres', createUserDto.nombres);
      expect(result).toHaveProperty('apellidos', createUserDto.apellidos);
      expect(result).toHaveProperty('email', createUserDto.email);
      expect(result).toHaveProperty('rut', createUserDto.rut);
      expect(result).not.toHaveProperty('password');
      expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(
        createUserDto.password,
      );
    });

    it('should throw BadRequestException if emails do not match', async () => {
      await expect(
        service.create({
          ...createUserDto,
          emailConfirmacion: 'otro@example.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if regionId does not exist', async () => {
      mockRegionModel.findById.mockReturnValue(makeQueryChain(null));

      await expect(service.create(createUserDto)).rejects.toThrow(
        new NotFoundException('La región especificada no existe'),
      );
    });

    it('should throw NotFoundException if comunaId does not exist in region', async () => {
      mockComunaModel.findOne.mockReturnValue(makeQueryChain(null));

      await expect(service.create(createUserDto)).rejects.toThrow(
        NotFoundException,
      );
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

      expect(result).toHaveProperty('nombres', mockUserData.nombres);
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
