import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { EncryptionService } from '@/common/services/encryption.service';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Crear nuevo usuario
   */
  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    this.logger.log({
      message: 'Creating new user',
      rut: createUsuarioDto.rut,
      email: createUsuarioDto.email,
      // DO NOT log password
    });

    try {
      // Optimized: only select necessary fields for existence check and use lean()
      const existingUser = await this.userModel
        .findOne({
          $or: [
            { email: createUsuarioDto.email },
            { rut: createUsuarioDto.rut },
          ],
        })
        .select('email rut')
        .lean()
        .exec();

      if (existingUser) {
        if (existingUser.email === createUsuarioDto.email) {
          this.logger.warn({
            message: 'User creation failed: email already exists',
            email: createUsuarioDto.email,
          });
          throw new ConflictException('El email ya está registrado');
        }
        if (existingUser.rut === createUsuarioDto.rut) {
          this.logger.warn({
            message: 'User creation failed: RUT already exists',
            rut: createUsuarioDto.rut,
          });
          throw new ConflictException('El RUT ya está registrado');
        }
      }

      // Hash password con bcrypt
      const hashedPassword = await this.encryptionService.hashPassword(
        createUsuarioDto.password,
      );

      const newUser = new this.userModel({
        ...createUsuarioDto,
        password: hashedPassword,
        destinatarios: [],
        transferencia: [],
      });

      await newUser.save();

      this.logger.log({
        message: 'User created successfully',
        rut: newUser.rut,
        email: newUser.email,
      });

      return new UsuarioResponseDto({
        nombre: newUser.nombre,
        email: newUser.email,
        rut: newUser.rut,
        destinatarios: newUser.destinatarios,
        transferencia: newUser.transferencia,
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error({
        message: 'Error creating user',
        rut: createUsuarioDto.rut,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Obtener usuario por RUT y password (login)
   */
  async login(loginUsuarioDto: LoginUsuarioDto): Promise<UsuarioResponseDto> {
    this.logger.log({
      message: 'Login attempt',
      rut: loginUsuarioDto.rut,
      // DO NOT log password
    });

    try {
      const { rut, password } = loginUsuarioDto;

      // Buscar usuario e incluir password para comparación (select: false en schema)
      const user = await this.userModel.findOne({ rut }).select('+password');

      if (!user) {
        this.logger.warn({
          message: 'Login failed: user not found',
          rut,
        });
        throw new UnauthorizedException('RUT o contraseña incorrectos');
      }

      // Comparar password con hash usando bcrypt
      const isPasswordValid = await this.encryptionService.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        this.logger.warn({
          message: 'Login failed: invalid password',
          rut,
        });
        throw new UnauthorizedException('RUT o contraseña incorrectos');
      }

      this.logger.log({
        message: 'User authenticated successfully',
        rut: user.rut,
      });

      return new UsuarioResponseDto({
        nombre: user.nombre,
        email: user.email,
        rut: user.rut,
        destinatarios: user.destinatarios,
        transferencia: user.transferencia,
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error({
        message: 'Error during login',
        rut: loginUsuarioDto.rut,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Buscar usuario por RUT (método auxiliar)
   */
  async findByRut(rut: string): Promise<User | null> {
    return this.userModel.findOne({ rut });
  }
}
