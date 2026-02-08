import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TransferenciasController } from './transferencias.controller';
import { TransferenciasService } from './transferencias.service';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { TransferenciaResponseDto } from './dto/transferencia-response.dto';

describe('TransferenciasController', () => {
  let controller: TransferenciasController;
  let service: TransferenciasService;

  const mockTransferenciaResponse = new TransferenciaResponseDto({
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    rut_destinatario: '11111111-1',
    banco: 'Banco Chile',
    tipo_cuenta: 'Cuenta Corriente',
    monto: 50000,
    fecha: new Date('2026-02-08'),
  });

  const mockTransferenciasService = {
    create: jest.fn(),
    findByRut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferenciasController],
      providers: [
        {
          provide: TransferenciasService,
          useValue: mockTransferenciasService,
        },
      ],
    }).compile();

    controller = module.get<TransferenciasController>(TransferenciasController);
    service = module.get<TransferenciasService>(TransferenciasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createTransferenciaDto: CreateTransferenciaDto = {
      rut_cliente: '12345678-9',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      rut_destinatario: '11111111-1',
      banco: 'Banco Chile',
      tipo_cuenta: 'Cuenta Corriente',
      monto: 50000,
    };

    it('should create a transferencia successfully', async () => {
      mockTransferenciasService.create.mockResolvedValue(true);

      const result = await controller.create(createTransferenciaDto);

      expect(result).toEqual({
        ok: true,
        body: {
          message: 'Transferencia guardada!',
          created: true,
        },
      });
      expect(service.create).toHaveBeenCalledWith(createTransferenciaDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should return created:false if service returns false', async () => {
      mockTransferenciasService.create.mockResolvedValue(false);

      const result = await controller.create(createTransferenciaDto);

      expect(result).toEqual({
        ok: true,
        body: {
          message: 'Transferencia guardada!',
          created: false,
        },
      });
    });
  });

  describe('findByRut', () => {
    it('should return transferencias for a valid rut', async () => {
      mockTransferenciasService.findByRut.mockResolvedValue([
        mockTransferenciaResponse,
      ]);

      const result = await controller.findByRut('12345678-9');

      expect(result).toEqual({
        ok: true,
        body: {
          historial: [mockTransferenciaResponse],
        },
      });
      expect(service.findByRut).toHaveBeenCalledWith('12345678-9');
      expect(service.findByRut).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if user has no transferencias', async () => {
      mockTransferenciasService.findByRut.mockResolvedValue([]);

      const result = await controller.findByRut('12345678-9');

      expect(result).toEqual({
        ok: true,
        body: {
          historial: [],
        },
      });
    });

    it('should throw BadRequestException if rut is missing', async () => {
      await expect(controller.findByRut(undefined as any)).rejects.toThrow(
        new BadRequestException('El RUT es requerido'),
      );
    });

    it('should throw BadRequestException if rut is empty string', async () => {
      await expect(controller.findByRut('')).rejects.toThrow(
        new BadRequestException('El RUT es requerido'),
      );
    });

    it('should return historial data in the response', async () => {
      mockTransferenciasService.findByRut.mockResolvedValue([
        mockTransferenciaResponse,
      ]);

      const result = await controller.findByRut('12345678-9');

      expect(result.ok).toBe(true);
      expect(result.body.historial).toHaveLength(1);
      expect(result.body.historial[0]).toHaveProperty('nombre');
      expect(result.body.historial[0]).toHaveProperty('monto');
      expect(result.body.historial[0]).toHaveProperty('fecha');
    });
  });
});
