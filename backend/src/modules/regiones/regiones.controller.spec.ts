import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { RegionesController } from './regiones.controller';
import { RegionesService } from './regiones.service';
import { Region } from './schemas/region.schema';
import { Comuna } from './schemas/comuna.schema';

describe('RegionesController', () => {
  let controller: RegionesController;
  let service: RegionesService;

  const mockRegionId = new Types.ObjectId().toHexString();

  const mockRegiones: Partial<Region>[] = [
    {
      _id: new Types.ObjectId(mockRegionId) as any,
      nombre: 'Arica y Parinacota',
      codigo: 'CL-AP',
      ordinal: 'XV',
      cut: '15',
    },
    {
      _id: new Types.ObjectId() as any,
      nombre: 'Tarapacá',
      codigo: 'CL-TA',
      ordinal: 'I',
      cut: '01',
    },
  ];

  const mockComunas: Partial<Comuna>[] = [
    {
      _id: new Types.ObjectId() as any,
      nombre: 'Arica',
      regionId: new Types.ObjectId(mockRegionId),
    },
    {
      _id: new Types.ObjectId() as any,
      nombre: 'Camarones',
      regionId: new Types.ObjectId(mockRegionId),
    },
  ];

  const mockRegionesService = {
    findAllRegiones: jest.fn(),
    findComunasByRegion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionesController],
      providers: [{ provide: RegionesService, useValue: mockRegionesService }],
    }).compile();

    controller = module.get<RegionesController>(RegionesController);
    service = module.get<RegionesService>(RegionesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all regions wrapped in response envelope', async () => {
      mockRegionesService.findAllRegiones.mockResolvedValue(mockRegiones);

      const result = await controller.findAll();

      expect(result).toEqual({ ok: true, body: { regiones: mockRegiones } });
      expect(service.findAllRegiones).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no regions exist', async () => {
      mockRegionesService.findAllRegiones.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual({ ok: true, body: { regiones: [] } });
    });
  });

  describe('findComunas', () => {
    it('should return comunas for a valid region id', async () => {
      mockRegionesService.findComunasByRegion.mockResolvedValue(mockComunas);

      const result = await controller.findComunas(mockRegionId);

      expect(result).toEqual({ ok: true, body: { comunas: mockComunas } });
      expect(service.findComunasByRegion).toHaveBeenCalledWith(mockRegionId);
    });

    it('should propagate NotFoundException from service', async () => {
      mockRegionesService.findComunasByRegion.mockRejectedValue(
        new NotFoundException(`Region con id '${mockRegionId}' no encontrada`),
      );

      await expect(controller.findComunas(mockRegionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
