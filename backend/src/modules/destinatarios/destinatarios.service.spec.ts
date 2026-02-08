import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DestinatariosService } from './destinatarios.service';
import { User } from '../usuarios/schemas/user.schema';
import { CreateDestinatarioDto } from './dto/create-destinatario.dto';

describe('DestinatariosService', () => {
  let service: DestinatariosService;
  let mockUserModel: any;

  const mockDestinatario = {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    rut_destinatario: '11111111-1',
    telefono: '987654321',
    banco: 'Banco Chile',
    tipo_cuenta: 'Cuenta Corriente',
    numero_cuenta: 123456789,
  };

  const mockUserData = {
    nombre: 'Test User',
    email: 'test@example.com',
    rut: '12345678-9',
    password: 'test123',
    destinatarios: [mockDestinatario],
    transferencia: [],
  };

  beforeEach(async () => {
    // Mock del modelo de Mongoose with chainable methods
    const mockExec = jest.fn();
    const mockLean = jest.fn(() => ({ exec: mockExec }));
    const mockSelect = jest.fn(() => ({ lean: mockLean, exec: mockExec }));
    const mockFindOne = jest.fn(() => ({
      select: mockSelect,
      lean: mockLean,
      exec: mockExec,
    }));

    mockUserModel = {
      findOne: mockFindOne,
      updateOne: jest.fn(),
      _mockChain: { exec: mockExec, lean: mockLean, select: mockSelect },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinatariosService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<DestinatariosService>(DestinatariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByRut', () => {
    it('should return destinatarios for a user', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue(mockUserData);

      const result = await service.findByRut('12345678-9');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('nombre', 'Juan');
      expect(result[0]).toHaveProperty('rut_destinatario', '11111111-1');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        rut: '12345678-9',
      });
    });

    it('should return empty array if user has no destinatarios', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        destinatarios: [],
      });

      const result = await service.findByRut('12345678-9');

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should return empty array if user destinatarios is undefined', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        destinatarios: undefined,
      });

      const result = await service.findByRut('12345678-9');

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue(null);

      await expect(service.findByRut('99999999-9')).rejects.toThrow(
        new NotFoundException('El cliente 99999999-9 no existe'),
      );
    });
  });

  describe('create', () => {
    const createDestinatarioDto: CreateDestinatarioDto = {
      rut_cliente: '12345678-9',
      nombre: 'Pedro',
      apellido: 'González',
      email: 'pedro@example.com',
      rut_destinatario: '22222222-2',
      telefono: '987654321',
      banco: 'Banco Estado',
      tipo_cuenta: 'Cuenta Vista',
      numero_cuenta: 987654321,
    };

    it('should create a new destinatario successfully', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        destinatarios: [mockDestinatario],
      });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.create(createDestinatarioDto);

      expect(result).toBe(true);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        rut: '12345678-9',
      });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { rut: '12345678-9' },
        {
          $push: {
            destinatarios: {
              nombre: 'Pedro',
              apellido: 'González',
              email: 'pedro@example.com',
              rut_destinatario: '22222222-2',
              telefono: '987654321',
              banco: 'Banco Estado',
              tipo_cuenta: 'Cuenta Vista',
              numero_cuenta: 987654321,
            },
          },
        },
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue(null);

      await expect(service.create(createDestinatarioDto)).rejects.toThrow(
        new NotFoundException('El cliente 12345678-9 no existe'),
      );
    });

    it('should throw BadRequestException if destinatario already exists', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        destinatarios: [
          {
            ...mockDestinatario,
            rut_destinatario: '22222222-2', // Same RUT as in createDestinatarioDto
          },
        ],
      });

      await expect(service.create(createDestinatarioDto)).rejects.toThrow(
        new BadRequestException(
          'El destinatario con RUT 22222222-2 ya está registrado',
        ),
      );
    });

    it('should return false if update fails', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        destinatarios: [],
      });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await service.create(createDestinatarioDto);

      expect(result).toBe(false);
    });

    it('should handle user with undefined destinatarios array', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        destinatarios: undefined,
      });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.create(createDestinatarioDto);

      expect(result).toBe(true);
    });
  });
});
