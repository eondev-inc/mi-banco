import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { RegionesService } from './regiones.service';
import { Region } from './schemas/region.schema';
import { Comuna } from './schemas/comuna.schema';

describe('RegionesService', () => {
  let service: RegionesService;
  let mockRegionModel: any;
  let mockComunaModel: any;

  const mockRegionId = new Types.ObjectId().toHexString();

  const mockRegiones = [
    {
      _id: new Types.ObjectId(mockRegionId),
      nombre: 'Arica y Parinacota',
      codigo: 'CL-AP',
      ordinal: 'XV',
      cut: '15',
    },
    {
      _id: new Types.ObjectId(),
      nombre: 'Tarapacá',
      codigo: 'CL-TA',
      ordinal: 'I',
      cut: '01',
    },
  ];

  const mockComunas = [
    {
      _id: new Types.ObjectId(),
      nombre: 'Arica',
      regionId: new Types.ObjectId(mockRegionId),
    },
    {
      _id: new Types.ObjectId(),
      nombre: 'Camarones',
      regionId: new Types.ObjectId(mockRegionId),
    },
  ];

  // Helper to build a chainable query mock
  const makeQueryChain = (resolvedValue: any) => {
    const chain = {
      select: jest.fn(),
      sort: jest.fn(),
      lean: jest.fn(),
      exec: jest.fn().mockResolvedValue(resolvedValue),
    };
    chain.select.mockReturnValue(chain);
    chain.sort.mockReturnValue(chain);
    chain.lean.mockReturnValue(chain);
    return chain;
  };

  beforeEach(async () => {
    mockRegionModel = {
      find: jest.fn(),
      exists: jest.fn(),
    };

    mockComunaModel = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionesService,
        { provide: getModelToken(Region.name), useValue: mockRegionModel },
        { provide: getModelToken(Comuna.name), useValue: mockComunaModel },
      ],
    }).compile();

    service = module.get<RegionesService>(RegionesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  describe('findAllRegiones', () => {
    it('should return all regions sorted by CUT', async () => {
      mockRegionModel.find.mockReturnValue(makeQueryChain(mockRegiones));

      const result = await service.findAllRegiones();

      expect(result).toEqual(mockRegiones);
      expect(mockRegionModel.find).toHaveBeenCalledWith();
    });

    it('should return an empty array when no regions exist', async () => {
      mockRegionModel.find.mockReturnValue(makeQueryChain([]));

      const result = await service.findAllRegiones();

      expect(result).toEqual([]);
    });
  });

  // ---------------------------------------------------------------------------
  describe('findComunasByRegion', () => {
    it('should return comunas for an existing region', async () => {
      const existsChain = {
        lean: jest.fn(),
        exec: jest.fn().mockResolvedValue({ _id: mockRegionId }),
      };
      existsChain.lean.mockReturnValue(existsChain);
      mockRegionModel.exists.mockReturnValue(existsChain);
      mockComunaModel.find.mockReturnValue(makeQueryChain(mockComunas));

      const result = await service.findComunasByRegion(mockRegionId);

      expect(result).toEqual(mockComunas);
      expect(mockRegionModel.exists).toHaveBeenCalledWith({
        _id: mockRegionId,
      });
    });

    it('should throw NotFoundException for an invalid ObjectId', async () => {
      await expect(
        service.findComunasByRegion('not-an-object-id'),
      ).rejects.toThrow(NotFoundException);
      expect(mockRegionModel.exists).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when region does not exist in DB', async () => {
      const existsChain = {
        lean: jest.fn(),
        exec: jest.fn().mockResolvedValue(null),
      };
      existsChain.lean.mockReturnValue(existsChain);
      mockRegionModel.exists.mockReturnValue(existsChain);

      await expect(service.findComunasByRegion(mockRegionId)).rejects.toThrow(
        new NotFoundException(`Region con id '${mockRegionId}' no encontrada`),
      );
      expect(mockComunaModel.find).not.toHaveBeenCalled();
    });

    it('should return empty comunas array for a region with no comunas', async () => {
      const existsChain = {
        lean: jest.fn(),
        exec: jest.fn().mockResolvedValue({ _id: mockRegionId }),
      };
      existsChain.lean.mockReturnValue(existsChain);
      mockRegionModel.exists.mockReturnValue(existsChain);
      mockComunaModel.find.mockReturnValue(makeQueryChain([]));

      const result = await service.findComunasByRegion(mockRegionId);

      expect(result).toEqual([]);
    });
  });
});
