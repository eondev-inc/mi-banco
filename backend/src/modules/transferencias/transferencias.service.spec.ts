import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { TransferenciasService } from './transferencias.service';
import { User } from '../usuarios/schemas/user.schema';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

describe('TransferenciasService', () => {
  let service: TransferenciasService;
  let mockUserModel: any;

  const mockTransferencia = {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    rut_destinatario: '11111111-1',
    banco: 'Banco Chile',
    tipo_cuenta: 'Cuenta Corriente',
    monto: 50000,
    fecha: new Date('2026-02-08'),
  };

  const mockUserData = {
    nombre: 'Test User',
    email: 'test@example.com',
    rut: '12345678-9',
    password: 'test123',
    destinatarios: [],
    transferencia: [mockTransferencia],
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
    const mockExists = jest.fn(() => ({
      lean: mockLean,
      exec: mockExec,
    }));

    mockUserModel = {
      findOne: mockFindOne,
      updateOne: jest.fn(),
      exists: mockExists,
      _mockChain: { exec: mockExec, lean: mockLean, select: mockSelect },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferenciasService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<TransferenciasService>(TransferenciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByRut', () => {
    it('should return transferencias for a user', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue(mockUserData);

      const result = await service.findByRut('12345678-9');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('nombre', 'Juan Pérez');
      expect(result[0]).toHaveProperty('monto', 50000);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        rut: '12345678-9',
      });
    });

    it('should return empty array if user has no transferencias', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        transferencia: [],
      });

      const result = await service.findByRut('12345678-9');

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should return empty array if user transferencia is undefined', async () => {
      mockUserModel._mockChain.exec.mockResolvedValue({
        ...mockUserData,
        transferencia: undefined,
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
    const createTransferenciaDto: CreateTransferenciaDto = {
      rut_cliente: '12345678-9',
      nombre: 'Pedro González',
      email: 'pedro@example.com',
      rut_destinatario: '22222222-2',
      banco: 'Banco Estado',
      tipo_cuenta: 'Cuenta Vista',
      monto: 75000,
    };

    it('should create a new transferencia successfully', async () => {
      mockUserModel.exists.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
        }),
      });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.create(createTransferenciaDto);

      expect(result).toBe(true);
      expect(mockUserModel.exists).toHaveBeenCalledWith({
        rut: '12345678-9',
      });
      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { rut: '12345678-9' },
        {
          $push: {
            transferencia: expect.objectContaining({
              nombre: 'Pedro González',
              email: 'pedro@example.com',
              rut_destinatario: '22222222-2',
              banco: 'Banco Estado',
              tipo_cuenta: 'Cuenta Vista',
              monto: 75000,
              fecha: expect.any(Date),
            }),
          },
        },
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserModel.exists.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.create(createTransferenciaDto)).rejects.toThrow(
        new NotFoundException('El cliente 12345678-9 no existe'),
      );
    });

    it('should return false if update fails', async () => {
      mockUserModel.exists.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
        }),
      });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await service.create(createTransferenciaDto);

      expect(result).toBe(false);
    });

    it('should add fecha field automatically', async () => {
      mockUserModel.exists.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
        }),
      });
      mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      await service.create(createTransferenciaDto);

      expect(mockUserModel.updateOne).toHaveBeenCalledWith(
        { rut: '12345678-9' },
        {
          $push: {
            transferencia: expect.objectContaining({
              fecha: expect.any(Date),
            }),
          },
        },
      );
    });
  });
});
