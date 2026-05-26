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
		it('debe retornar destinatarios de un usuario existente', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue(mockUserData);

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('nombre', 'Juan');
			expect(result[0]).toHaveProperty('rut_destinatario', '11111111-1');
			expect(mockUserModel.findOne).toHaveBeenCalledWith({ rut: '12345678-9' });
		});

		it('debe retornar array vacío si el usuario no tiene destinatarios', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [],
			});

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(0);
			expect(result).toEqual([]);
		});

		it('debe retornar array vacío si destinatarios es undefined', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: undefined,
			});

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(0);
			expect(result).toEqual([]);
		});

		it('debe lanzar NotFoundException si el usuario no existe', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue(null);

			await expect(service.findByRut('99999999-9')).rejects.toThrow(
				new NotFoundException('El cliente 99999999-9 no existe'),
			);
		});

		it('debe mapear los destinatarios a DestinatarioResponseDto', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue(mockUserData);

			const result = await service.findByRut('12345678-9');

			expect(result[0]).toHaveProperty('nombre');
			expect(result[0]).toHaveProperty('apellido');
			expect(result[0]).toHaveProperty('email');
			expect(result[0]).toHaveProperty('rut_destinatario');
			expect(result[0]).toHaveProperty('telefono');
			expect(result[0]).toHaveProperty('banco');
			expect(result[0]).toHaveProperty('tipo_cuenta');
			expect(result[0]).toHaveProperty('numero_cuenta');
		});

		it('debe retornar múltiples destinatarios correctamente', async () => {
			const segundoDestinatario = {
				nombre: 'María',
				apellido: 'González',
				email: 'maria@example.com',
				rut_destinatario: '22222222-2',
				telefono: '912345678',
				banco: 'Banco Estado',
				tipo_cuenta: 'Cuenta Vista',
				numero_cuenta: 987654321,
			};
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [mockDestinatario, segundoDestinatario],
			});

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(2);
		});

		it('debe propagar errores inesperados del modelo', async () => {
			const errorDb = new Error('DB connection lost');
			mockUserModel._mockChain.exec.mockRejectedValue(errorDb);

			await expect(service.findByRut('12345678-9')).rejects.toThrow('DB connection lost');
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

		it('debe agregar un destinatario nuevo exitosamente y retornar true', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [mockDestinatario],
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			const result = await service.create(createDestinatarioDto);

			expect(result).toBe(true);
			expect(mockUserModel.findOne).toHaveBeenCalledWith({ rut: '12345678-9' });
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

		it('debe lanzar NotFoundException si el usuario origen no existe', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue(null);

			await expect(service.create(createDestinatarioDto)).rejects.toThrow(
				new NotFoundException('El cliente 12345678-9 no existe'),
			);
		});

		it('debe lanzar BadRequestException si el destinatario ya está registrado (duplicado)', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [
					{
						...mockDestinatario,
						rut_destinatario: '22222222-2',
					},
				],
			});

			await expect(service.create(createDestinatarioDto)).rejects.toThrow(
				new BadRequestException('El destinatario con RUT 22222222-2 ya está registrado'),
			);
			expect(mockUserModel.updateOne).not.toHaveBeenCalled();
		});

		it('debe retornar false si updateOne no modifica ningún documento', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [],
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

			const result = await service.create(createDestinatarioDto);

			expect(result).toBe(false);
		});

		it('debe manejar el caso donde destinatarios es undefined (primer destinatario)', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: undefined,
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			const result = await service.create(createDestinatarioDto);

			expect(result).toBe(true);
		});

		it('no debe incluir rut_cliente en el objeto destinatario guardado', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [],
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			await service.create(createDestinatarioDto);

			const llamada = mockUserModel.updateOne.mock.calls[0];
			const destinatarioGuardado = llamada[1].$push.destinatarios;

			expect(destinatarioGuardado).not.toHaveProperty('rut_cliente');
		});

		it('debe usar $push para agregar el destinatario al array del usuario', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [],
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			await service.create(createDestinatarioDto);

			const llamada = mockUserModel.updateOne.mock.calls[0];
			expect(llamada[1]).toHaveProperty('$push');
			expect(llamada[1].$push).toHaveProperty('destinatarios');
		});

		it('debe propagar errores inesperados del modelo', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [],
			});
			const errorDb = new Error('Write timeout');
			mockUserModel.updateOne.mockRejectedValue(errorDb);

			await expect(service.create(createDestinatarioDto)).rejects.toThrow('Write timeout');
		});

		it('no debe lanzar error con destinatarios de RUT distinto (no duplicado)', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				destinatarios: [mockDestinatario], // rut_destinatario: '11111111-1'
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			// '22222222-2' es diferente a '11111111-1' → no es duplicado
			const result = await service.create(createDestinatarioDto);

			expect(result).toBe(true);
		});
	});
});
