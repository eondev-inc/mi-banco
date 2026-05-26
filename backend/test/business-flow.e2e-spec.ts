import { Test, TestingModule } from '@nestjs/testing';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

/**
 * Flujo de negocio completo E2E:
 * 1. Crear usuario
 * 2. Login
 * 3. Crear destinatario (beneficiario)
 * 4. Realizar transferencia
 */
describe('Business Flow (e2e)', () => {
	let app: NestFastifyApplication;

	// Datos compartidos entre pasos del flujo
	let regionId: string;
	let comunaId: string;

	// RUTs únicos por ejecución para evitar colisiones con datos de otros tests
	const ts = Date.now();
	const rutBase = String(ts).slice(-7);
	const testRut = `${rutBase}-${Number(rutBase[rutBase.length - 1]) % 10}`;
	const destinatarioRut = `${String(ts + 1).slice(-7)}-${(ts + 1) % 10}`;

	const testPassword = 'flujo123456';
	const testEmail = `flujo_${ts}@example.com`;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);

		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
				transformOptions: {
					enableImplicitConversion: true,
				},
			}),
		);

		await app.init();
		await app.getHttpAdapter().getInstance().ready();

		// Obtener region y comuna reales de la base de datos
		const regResult = await app.inject({
			method: 'GET',
			url: '/regiones',
		});
		const regBody = JSON.parse(regResult.payload);
		if (regBody.ok && regBody.body.regiones.length > 0) {
			regionId = regBody.body.regiones[0]._id;

			const comResult = await app.inject({
				method: 'GET',
				url: `/regiones/${regionId}/comunas`,
			});
			const comBody = JSON.parse(comResult.payload);
			if (comBody.ok && comBody.body.comunas.length > 0) {
				comunaId = comBody.body.comunas[0]._id;
			}
		}
	}, 30000);

	afterAll(async () => {
		await app.close();
	});

	describe('Paso 1: Crear usuario', () => {
		it('debe crear un usuario con todos los campos requeridos', async () => {
			const nuevoUsuario = {
				nombres: 'Juan',
				apellidos: 'Pérez Soto',
				email: testEmail,
				emailConfirmacion: testEmail,
				rut: testRut,
				telefono: '+56912345678',
				fechaNacimiento: '1990-05-15',
				direccion: 'Av. Providencia 1234',
				regionId,
				comunaId,
				password: testPassword,
			};

			const result = await app.inject({
				method: 'POST',
				url: '/usuario',
				payload: nuevoUsuario,
			});

			expect(result.statusCode).toEqual(200);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(true);
			expect(body.body.usuario).toHaveProperty('nombres', 'Juan');
			expect(body.body.usuario).toHaveProperty('apellidos', 'Pérez Soto');
			expect(body.body.usuario).toHaveProperty('email', testEmail);
			expect(body.body.usuario).toHaveProperty('rut', testRut);
			expect(body.body.usuario).not.toHaveProperty('password');
			expect(body.body.usuario).toHaveProperty('destinatarios');
			expect(body.body.usuario).toHaveProperty('transferencia');
			expect(Array.isArray(body.body.usuario.destinatarios)).toBe(true);
		});
	});

	describe('Paso 2: Login', () => {
		it('debe autenticar al usuario con credenciales correctas', async () => {
			const result = await app.inject({
				method: 'POST',
				url: '/usuario/login',
				payload: {
					rut: testRut,
					password: testPassword,
				},
			});

			expect(result.statusCode).toEqual(200);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(true);
			expect(body.body.usuario).toHaveProperty('rut', testRut);
			expect(body.body.usuario).toHaveProperty('email', testEmail);
			expect(body.body.usuario).not.toHaveProperty('password');
		});

		it('debe rechazar credenciales incorrectas después del registro', async () => {
			const result = await app.inject({
				method: 'POST',
				url: '/usuario/login',
				payload: {
					rut: testRut,
					password: 'contrasenaIncorrecta',
				},
			});

			expect(result.statusCode).toEqual(401);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(false);
		});
	});

	describe('Paso 3: Crear destinatario', () => {
		it('debe agregar un destinatario al usuario registrado', async () => {
			const nuevoDestinatario = {
				rut_cliente: testRut,
				nombre: 'María',
				apellido: 'González López',
				email: 'maria.gonzalez@example.com',
				rut_destinatario: destinatarioRut,
				telefono: '987654321',
				banco: 'Banco de Chile',
				tipo_cuenta: 'Cuenta Corriente',
				numero_cuenta: 123456789,
			};

			const result = await app.inject({
				method: 'POST',
				url: '/cuentas',
				payload: nuevoDestinatario,
			});

			expect(result.statusCode).toEqual(200);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(true);
			expect(body.body).toHaveProperty('created', true);
			expect(body.body).toHaveProperty('message');
		});

		it('debe listar los destinatarios del usuario incluyendo el recién creado', async () => {
			const result = await app.inject({
				method: 'GET',
				url: `/cuentas?rut=${testRut}`,
			});

			expect(result.statusCode).toEqual(200);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(true);
			expect(body.body).toHaveProperty('destinatarios');
			expect(Array.isArray(body.body.destinatarios)).toBe(true);

			const encontrado = body.body.destinatarios.find(
				(d: any) => d.rut_destinatario === destinatarioRut,
			);
			expect(encontrado).toBeDefined();
			expect(encontrado).toHaveProperty('nombre', 'María');
			expect(encontrado).toHaveProperty('banco', 'Banco de Chile');
		});
	});

	describe('Paso 4: Realizar transferencia', () => {
		it('debe crear una transferencia exitosa al destinatario registrado', async () => {
			const nuevaTransferencia = {
				rut_cliente: testRut,
				nombre: 'María González López',
				email: 'maria.gonzalez@example.com',
				rut_destinatario: destinatarioRut,
				banco: 'Banco de Chile',
				tipo_cuenta: 'Cuenta Corriente',
				monto: 50000,
			};

			const result = await app.inject({
				method: 'POST',
				url: '/transferencias',
				payload: nuevaTransferencia,
			});

			expect(result.statusCode).toEqual(200);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(true);
			expect(body.body).toHaveProperty('created', true);
			expect(body.body).toHaveProperty('message');
		});

		it('debe registrar la transferencia en el historial del usuario', async () => {
			const result = await app.inject({
				method: 'GET',
				url: `/transferencias?rut=${testRut}`,
			});

			expect(result.statusCode).toEqual(200);

			const body = JSON.parse(result.payload);
			expect(body.ok).toBe(true);
			expect(body.body).toHaveProperty('historial');
			expect(Array.isArray(body.body.historial)).toBe(true);
			expect(body.body.historial.length).toBeGreaterThan(0);

			const transferencia = body.body.historial[0];
			expect(transferencia).toHaveProperty('nombre');
			expect(transferencia).toHaveProperty('monto');
			expect(transferencia).toHaveProperty('fecha');
		});
	});
});
