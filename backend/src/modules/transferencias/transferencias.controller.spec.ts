import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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

		it('debe delegar al servicio y retornar respuesta exitosa', async () => {
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

		it('debe retornar created:false cuando el servicio retorna false', async () => {
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

		it('debe propagar NotFoundException del servicio cuando usuario no existe', async () => {
			mockTransferenciasService.create.mockRejectedValue(
				new NotFoundException('El cliente 12345678-9 no existe'),
			);

			await expect(controller.create(createTransferenciaDto)).rejects.toThrow(NotFoundException);
		});

		it('debe llamar al servicio exactamente una vez con el DTO completo', async () => {
			mockTransferenciasService.create.mockResolvedValue(true);

			await controller.create(createTransferenciaDto);

			expect(service.create).toHaveBeenCalledTimes(1);
			expect(service.create).toHaveBeenCalledWith(
				expect.objectContaining({
					rut_cliente: '12345678-9',
					monto: 50000,
					rut_destinatario: '11111111-1',
				}),
			);
		});

		it('debe retornar ok:true independientemente del resultado del servicio', async () => {
			mockTransferenciasService.create.mockResolvedValue(false);

			const result = await controller.create(createTransferenciaDto);

			expect(result.ok).toBe(true);
		});
	});

	describe('findByRut', () => {
		it('debe retornar historial para un RUT válido', async () => {
			mockTransferenciasService.findByRut.mockResolvedValue([mockTransferenciaResponse]);

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

		it('debe retornar historial vacío si el usuario no tiene transferencias', async () => {
			mockTransferenciasService.findByRut.mockResolvedValue([]);

			const result = await controller.findByRut('12345678-9');

			expect(result).toEqual({
				ok: true,
				body: {
					historial: [],
				},
			});
		});

		it('debe lanzar BadRequestException si el rut es undefined', async () => {
			await expect(controller.findByRut(undefined as any)).rejects.toThrow(
				new BadRequestException('El RUT es requerido'),
			);
			expect(service.findByRut).not.toHaveBeenCalled();
		});

		it('debe lanzar BadRequestException si el rut es string vacío', async () => {
			await expect(controller.findByRut('')).rejects.toThrow(
				new BadRequestException('El RUT es requerido'),
			);
			expect(service.findByRut).not.toHaveBeenCalled();
		});

		it('no debe llamar al servicio cuando el rut no está presente', async () => {
			try {
				await controller.findByRut(undefined as any);
			} catch (_) {
				// esperado
			}

			expect(service.findByRut).not.toHaveBeenCalled();
		});

		it('debe propagar NotFoundException del servicio cuando usuario no existe', async () => {
			mockTransferenciasService.findByRut.mockRejectedValue(
				new NotFoundException('El cliente 12345678-9 no existe'),
			);

			await expect(controller.findByRut('12345678-9')).rejects.toThrow(NotFoundException);
		});

		it('debe retornar la estructura correcta con ok y body.historial', async () => {
			mockTransferenciasService.findByRut.mockResolvedValue([mockTransferenciaResponse]);

			const result = await controller.findByRut('12345678-9');

			expect(result.ok).toBe(true);
			expect(result.body).toHaveProperty('historial');
			expect(result.body.historial).toHaveLength(1);
			expect(result.body.historial[0]).toHaveProperty('nombre');
			expect(result.body.historial[0]).toHaveProperty('monto');
			expect(result.body.historial[0]).toHaveProperty('fecha');
		});

		it('debe retornar múltiples transferencias correctamente', async () => {
			const segunda = new TransferenciaResponseDto({
				nombre: 'Ana Rojas',
				email: 'ana@example.com',
				rut_destinatario: '22222222-2',
				banco: 'Banco Estado',
				tipo_cuenta: 'Cuenta Vista',
				monto: 200000,
				fecha: new Date('2026-01-15'),
			});
			mockTransferenciasService.findByRut.mockResolvedValue([
				mockTransferenciaResponse,
				segunda,
			]);

			const result = await controller.findByRut('12345678-9');

			expect(result.body.historial).toHaveLength(2);
		});
	});
});
