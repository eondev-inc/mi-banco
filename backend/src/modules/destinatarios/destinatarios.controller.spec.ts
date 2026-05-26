import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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

		it('debe delegar al servicio y retornar respuesta exitosa', async () => {
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

		it('debe retornar created:false cuando el servicio retorna false', async () => {
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

		it('debe propagar NotFoundException del servicio cuando usuario no existe', async () => {
			mockDestinatariosService.create.mockRejectedValue(
				new NotFoundException('El cliente 12345678-9 no existe'),
			);

			await expect(controller.create(createDestinatarioDto)).rejects.toThrow(NotFoundException);
		});

		it('debe propagar BadRequestException del servicio cuando destinatario duplicado', async () => {
			mockDestinatariosService.create.mockRejectedValue(
				new BadRequestException('El destinatario con RUT 11111111-1 ya está registrado'),
			);

			await expect(controller.create(createDestinatarioDto)).rejects.toThrow(BadRequestException);
		});

		it('debe llamar al servicio exactamente una vez con el DTO completo', async () => {
			mockDestinatariosService.create.mockResolvedValue(true);

			await controller.create(createDestinatarioDto);

			expect(service.create).toHaveBeenCalledTimes(1);
			expect(service.create).toHaveBeenCalledWith(
				expect.objectContaining({
					rut_cliente: '12345678-9',
					rut_destinatario: '11111111-1',
					nombre: 'Juan',
				}),
			);
		});

		it('debe retornar ok:true independientemente del resultado del servicio', async () => {
			mockDestinatariosService.create.mockResolvedValue(false);

			const result = await controller.create(createDestinatarioDto);

			expect(result.ok).toBe(true);
		});
	});

	describe('findByRut', () => {
		it('debe retornar destinatarios para un RUT válido', async () => {
			mockDestinatariosService.findByRut.mockResolvedValue([mockDestinatarioResponse]);

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

		it('debe retornar array vacío si el usuario no tiene destinatarios', async () => {
			mockDestinatariosService.findByRut.mockResolvedValue([]);

			const result = await controller.findByRut('12345678-9');

			expect(result).toEqual({
				ok: true,
				body: {
					destinatarios: [],
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
			mockDestinatariosService.findByRut.mockRejectedValue(
				new NotFoundException('El cliente 12345678-9 no existe'),
			);

			await expect(controller.findByRut('12345678-9')).rejects.toThrow(NotFoundException);
		});

		it('debe retornar la estructura correcta con ok y body.destinatarios', async () => {
			mockDestinatariosService.findByRut.mockResolvedValue([mockDestinatarioResponse]);

			const result = await controller.findByRut('12345678-9');

			expect(result.ok).toBe(true);
			expect(result.body).toHaveProperty('destinatarios');
			expect(result.body.destinatarios).toHaveLength(1);
			expect(result.body.destinatarios[0]).toHaveProperty('nombre');
			expect(result.body.destinatarios[0]).toHaveProperty('rut_destinatario');
			expect(result.body.destinatarios[0]).toHaveProperty('banco');
		});

		it('debe retornar múltiples destinatarios correctamente', async () => {
			const segundo = new DestinatarioResponseDto({
				nombre: 'María',
				apellido: 'González',
				email: 'maria@example.com',
				rut_destinatario: '22222222-2',
				telefono: '912345678',
				banco: 'Banco Estado',
				tipo_cuenta: 'Cuenta Vista',
				numero_cuenta: 987654321,
			});
			mockDestinatariosService.findByRut.mockResolvedValue([
				mockDestinatarioResponse,
				segundo,
			]);

			const result = await controller.findByRut('12345678-9');

			expect(result.body.destinatarios).toHaveLength(2);
		});
	});
});
