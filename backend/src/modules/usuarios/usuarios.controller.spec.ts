import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: UsuariosService;

  const mockUsuarioResponse = new UsuarioResponseDto({
    nombre: 'Test User',
    email: 'test@example.com',
    rut: '12345678-9',
    destinatarios: [],
    transferencia: [],
  });

  const mockUsuariosService = {
    create: jest.fn(),
    login: jest.fn(),
    findByRut: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    service = module.get<UsuariosService>(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUsuarioDto = {
      nombre: 'Test User',
      email: 'test@example.com',
      rut: '12345678-9',
      password: 'test123',
    };

    it('should create a user successfully', async () => {
      mockUsuariosService.create.mockResolvedValue(mockUsuarioResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        ok: true,
        body: {
          usuario: mockUsuarioResponse,
        },
      });
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should return user data in the response', async () => {
      mockUsuariosService.create.mockResolvedValue(mockUsuarioResponse);

      const result = await controller.create(createUserDto);

      expect(result.ok).toBe(true);
      expect(result.body.usuario).toHaveProperty('nombre');
      expect(result.body.usuario).toHaveProperty('email');
      expect(result.body.usuario).toHaveProperty('rut');
      expect(result.body.usuario).not.toHaveProperty('password');
    });
  });

  describe('login', () => {
    const loginDto: LoginUsuarioDto = {
      rut: '12345678-9',
      password: 'test123',
    };

    it('should login user with valid credentials', async () => {
      mockUsuariosService.login.mockResolvedValue(mockUsuarioResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        ok: true,
        body: {
          usuario: mockUsuarioResponse,
        },
      });
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(service.login).toHaveBeenCalledTimes(1);
    });

    it('should return user data in the response', async () => {
      mockUsuariosService.login.mockResolvedValue(mockUsuarioResponse);

      const result = await controller.login(loginDto);

      expect(result.ok).toBe(true);
      expect(result.body.usuario).toHaveProperty('nombre');
      expect(result.body.usuario).toHaveProperty('email');
      expect(result.body.usuario).toHaveProperty('rut');
      expect(result.body.usuario).not.toHaveProperty('password');
    });
  });
});
