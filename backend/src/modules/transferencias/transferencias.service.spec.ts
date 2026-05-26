import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { TransferenciasService } from './transferencias.service';
import { User } from '../usuarios/schemas/user.schema';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';

describe('TransferenciasService', () => {
	let service: TransferenciasService;
	let mockUserModel: any;

	const mockTransferenciaAntigua = {
		nombre: 'Ana Soto',
		email: 'ana@example.com',
		rut_destinatario: '33333333-3',
		banco: 'Banco Estado',
		tipo_cuenta: 'Cuenta Vista',
		monto: 100000,
		fecha: new Date('2026-01-01'),
	};

	const mockTransferenciaReciente = {
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
		transferencia: [mockTransferenciaAntigua, mockTransferenciaReciente],
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
		it('debe retornar transferencias de un usuario existente', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				transferencia: [mockTransferenciaReciente],
			});

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(1);
			expect(result[0]).toHaveProperty('nombre', 'Juan Pérez');
			expect(result[0]).toHaveProperty('monto', 50000);
			expect(mockUserModel.findOne).toHaveBeenCalledWith({ rut: '12345678-9' });
		});

		it('debe retornar array vacío si el usuario no tiene transferencias', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				transferencia: [],
			});

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(0);
			expect(result).toEqual([]);
		});

		it('debe retornar array vacío si transferencia es undefined', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				transferencia: undefined,
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

		it('debe retornar las transferencias ordenadas por fecha descendente (más reciente primero)', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue(mockUserData);

			const result = await service.findByRut('12345678-9');

			expect(result).toHaveLength(2);
			// La más reciente (Feb 2026) debe ir primero
			expect(result[0]).toHaveProperty('fecha', mockTransferenciaReciente.fecha);
			expect(result[1]).toHaveProperty('fecha', mockTransferenciaAntigua.fecha);
		});

		it('debe propagar errores inesperados del modelo', async () => {
			const errorDb = new Error('DB connection lost');
			mockUserModel._mockChain.exec.mockRejectedValue(errorDb);

			await expect(service.findByRut('12345678-9')).rejects.toThrow('DB connection lost');
		});

		it('debe mapear las transferencias a TransferenciaResponseDto', async () => {
			mockUserModel._mockChain.exec.mockResolvedValue({
				...mockUserData,
				transferencia: [mockTransferenciaReciente],
			});

			const result = await service.findByRut('12345678-9');

			expect(result[0]).toHaveProperty('nombre');
			expect(result[0]).toHaveProperty('email');
			expect(result[0]).toHaveProperty('rut_destinatario');
			expect(result[0]).toHaveProperty('banco');
			expect(result[0]).toHaveProperty('tipo_cuenta');
			expect(result[0]).toHaveProperty('monto');
			expect(result[0]).toHaveProperty('fecha');
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

		it('debe crear una transferencia exitosamente y retornar true', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
				}),
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			const result = await service.create(createTransferenciaDto);

			expect(result).toBe(true);
			expect(mockUserModel.exists).toHaveBeenCalledWith({ rut: '12345678-9' });
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

		it('debe lanzar NotFoundException si el usuario origen no existe', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue(null),
				}),
			});

			await expect(service.create(createTransferenciaDto)).rejects.toThrow(
				new NotFoundException('El cliente 12345678-9 no existe'),
			);
		});

		it('debe retornar false si updateOne no modifica ningún documento', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
				}),
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

			const result = await service.create(createTransferenciaDto);

			expect(result).toBe(false);
		});

		it('debe agregar el campo fecha automáticamente al crear', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
				}),
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			const antes = new Date();
			await service.create(createTransferenciaDto);
			const despues = new Date();

			const llamada = mockUserModel.updateOne.mock.calls[0];
			const transferenciaGuardada = llamada[1].$push.transferencia;

			expect(transferenciaGuardada.fecha).toBeInstanceOf(Date);
			expect(transferenciaGuardada.fecha.getTime()).toBeGreaterThanOrEqual(antes.getTime());
			expect(transferenciaGuardada.fecha.getTime()).toBeLessThanOrEqual(despues.getTime());
		});

		it('no debe incluir rut_cliente en el objeto transferencia guardado', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
				}),
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			await service.create(createTransferenciaDto);

			const llamada = mockUserModel.updateOne.mock.calls[0];
			const transferenciaGuardada = llamada[1].$push.transferencia;

			expect(transferenciaGuardada).not.toHaveProperty('rut_cliente');
		});

		it('debe propagar errores inesperados del modelo', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
				}),
			});
			const errorDb = new Error('Write timeout');
			mockUserModel.updateOne.mockRejectedValue(errorDb);

			await expect(service.create(createTransferenciaDto)).rejects.toThrow('Write timeout');
		});

		it('debe usar $push para agregar la transferencia al array del usuario', async () => {
			mockUserModel.exists.mockReturnValue({
				lean: jest.fn().mockReturnValue({
					exec: jest.fn().mockResolvedValue({ _id: 'user-id' }),
				}),
			});
			mockUserModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

			await service.create(createTransferenciaDto);

			const llamada = mockUserModel.updateOne.mock.calls[0];
			expect(llamada[1]).toHaveProperty('$push');
			expect(llamada[1].$push).toHaveProperty('transferencia');
		});
	});
});
