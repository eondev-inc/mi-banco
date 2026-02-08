import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { DestinatariosController } from './destinatarios.controller';
import { DestinatariosService } from './destinatarios.service';
import { CreateDestinatarioDto } from './dto/create-destinatario.dto';
import { DestinatarioResponseDto } from './dto/destinatario-response.dto';

describe('DestinatariosController', () => {
  let controller: DestinatariosController;
  let service: DestinatariosService;

  const mockDestinatarioResponse = new DestinatarioResponseDto({
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@example.com',
    rut_destinatario: '11111111-1',
    telefono: '987654321',
    banco: 'Banco Chile',
    tipo_cuenta: 'Cuenta Corriente',
    numero_cuenta: 123456789,
  });

  const mockDestinatariosService = {
    create: jest.fn(),
    findByRut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DestinatariosController],
      providers: [
        {
          provide: DestinatariosService,
          useValue: mockDestinatariosService,
        },
      ],
    }).compile();

    controller = module.get<DestinatariosController>(DestinatariosController);
    service = module.get<DestinatariosService>(DestinatariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDestinatarioDto: CreateDestinatarioDto = {
      rut_cliente: '12345678-9',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      rut_destinatario: '11111111-1',
      telefono: '987654321',
      banco: 'Banco Chile',
      tipo_cuenta: 'Cuenta Corriente',
      numero_cuenta: 123456789,
    };

    it('should create a destinatario successfully', async () => {
      mockDestinatariosService.create.mockResolvedValue(true);

      const result = await controller.create(createDestinatarioDto);

      expect(result).toEqual({
        ok: true,
        body: {
          message: 'Destinatario agregado exitosamente',
          created: true,
        },
      });
      expect(service.create).toHaveBeenCalledWith(createDestinatarioDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should return created:false if service returns false', async () => {
      mockDestinatariosService.create.mockResolvedValue(false);

      const result = await controller.create(createDestinatarioDto);

      expect(result).toEqual({
        ok: true,
        body: {
          message: 'Destinatario agregado exitosamente',
          created: false,
        },
      });
    });
  });

  describe('findByRut', () => {
    it('should return destinatarios for a valid rut', async () => {
      mockDestinatariosService.findByRut.mockResolvedValue([
        mockDestinatarioResponse,
      ]);

      const result = await controller.findByRut('12345678-9');

      expect(result).toEqual({
        ok: true,
        body: {
          destinatarios: [mockDestinatarioResponse],
        },
      });
      expect(service.findByRut).toHaveBeenCalledWith('12345678-9');
      expect(service.findByRut).toHaveBeenCalledTimes(1);
    });

    it('should return empty array if user has no destinatarios', async () => {
      mockDestinatariosService.findByRut.mockResolvedValue([]);

      const result = await controller.findByRut('12345678-9');

      expect(result).toEqual({
        ok: true,
        body: {
          destinatarios: [],
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

    it('should return destinatarios data in the response', async () => {
      mockDestinatariosService.findByRut.mockResolvedValue([
        mockDestinatarioResponse,
      ]);

      const result = await controller.findByRut('12345678-9');

      expect(result.ok).toBe(true);
      expect(result.body.destinatarios).toHaveLength(1);
      expect(result.body.destinatarios[0]).toHaveProperty('nombre');
      expect(result.body.destinatarios[0]).toHaveProperty('rut_destinatario');
      expect(result.body.destinatarios[0]).toHaveProperty('banco');
    });
  });
});
