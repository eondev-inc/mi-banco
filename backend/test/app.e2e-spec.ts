import { Test, TestingModule } from '@nestjs/testing';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppModule } from './../src/app.module';

/**
 * Controlador auxiliar que lanza errores para verificar el HttpExceptionFilter.
 * No se incluye en ningún módulo de producción.
 */
@Controller('__test__')
class TestErrorController {
	@Get('500')
	throwInternalError(): never {
		// Error genérico (no HttpException) → el filtro debe capturar y retornar 500
		throw new Error('Error interno simulado para test');
	}

	@Get('404')
	throwNotFound(): never {
		throw new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND);
	}

	@Get('422')
	throwUnprocessable(): never {
		throw new HttpException(
			'Datos no procesables',
			HttpStatus.UNPROCESSABLE_ENTITY,
		);
	}
}

describe('AppController (e2e)', () => {
	let app: NestFastifyApplication;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
			controllers: [TestErrorController],
		}).compile();

		app = moduleFixture.createNestApplication<NestFastifyApplication>(
			new FastifyAdapter(),
		);

		await app.init();
		await app.getHttpAdapter().getInstance().ready();
	}, 30000);

	afterAll(async () => {
		await app.close();
	});

	describe('GET /', () => {
		it('debe retornar 200 con mensaje de bienvenida', async () => {
			const result = await app.inject({
				method: 'GET',
				url: '/',
			});

			expect(result.statusCode).toEqual(200);
			expect(result.payload).toBeDefined();
		});
	});

	describe('GET /health', () => {
		it('debe retornar estado del sistema', async () => {
			const result = await app.inject({
				method: 'GET',
				url: '/health',
			});

			expect(result.statusCode).toEqual(200);
			const body = JSON.parse(result.payload);
			expect(body).toHaveProperty('status');
			expect(body).toHaveProperty('database');
			expect(body).toHaveProperty('timestamp');
		});
	});

	describe('HttpExceptionFilter — formato normalizado de respuestas de error', () => {
		it('debe capturar un error genérico (no HttpException) y retornar 500 con formato { ok, body }', async () => {
			const result = await app.inject({
				method: 'GET',
				url: '/__test__/500',
			});

			expect(result.statusCode).toEqual(500);

			const body = JSON.parse(result.payload);
			// El filtro SIEMPRE retorna { ok: false, body: { message, error } }
			expect(body).toHaveProperty('ok', false);
			expect(body).toHaveProperty('body');
			expect(body.body).toHaveProperty('message');
			expect(body.body).toHaveProperty('error');
			// Mensaje genérico para errores no-HttpException
			expect(body.body.message).toBe('Error interno del servidor');
		});

		it('debe capturar HttpException 404 y retornar formato { ok: false, body } con statusCode 404', async () => {
			const result = await app.inject({
				method: 'GET',
				url: '/__test__/404',
			});

			expect(result.statusCode).toEqual(404);

			const body = JSON.parse(result.payload);
			expect(body).toHaveProperty('ok', false);
			expect(body).toHaveProperty('body');
			expect(body.body).toHaveProperty('message', 'Recurso no encontrado');
			expect(body.body).toHaveProperty('error');
		});

		it('debe capturar HttpException 422 y retornar formato { ok: false, body } con statusCode 422', async () => {
			const result = await app.inject({
				method: 'GET',
				url: '/__test__/422',
			});

			expect(result.statusCode).toEqual(422);

			const body = JSON.parse(result.payload);
			expect(body).toHaveProperty('ok', false);
			expect(body).toHaveProperty('body');
			expect(body.body).toHaveProperty('message', 'Datos no procesables');
		});

		it('debe retornar ok: false para cualquier ruta inexistente (404)', async () => {
			const result = await app.inject({
				method: 'GET',
				url: '/ruta-que-no-existe',
			});

			expect(result.statusCode).toEqual(404);
			const body = JSON.parse(result.payload);
			expect(body).toHaveProperty('ok', false);
			expect(body).toHaveProperty('body');
		});
	});
});
