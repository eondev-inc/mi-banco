import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { EncryptionService } from '@/common/services/encryption.service';
import { Region } from '@modules/regiones/schemas/region.schema';
import { Comuna } from '@modules/regiones/schemas/comuna.schema';

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Region.name) private readonly regionModel: Model<Region>,
    @InjectModel(Comuna.name) private readonly comunaModel: Model<Comuna>,
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
      // Validate email confirmation
      if (createUsuarioDto.email !== createUsuarioDto.emailConfirmacion) {
        throw new BadRequestException(
          'El email y la confirmación de email no coinciden',
        );
      }

      // Validate regionId exists
      const regionId = new Types.ObjectId(createUsuarioDto.regionId);
      const regionExists = await this.regionModel
        .findById(regionId)
        .select('_id')
        .lean()
        .exec();
      if (!regionExists) {
        throw new NotFoundException('La región especificada no existe');
      }

      // Validate comunaId exists and belongs to the given region
      const comunaId = new Types.ObjectId(createUsuarioDto.comunaId);
      const comunaExists = await this.comunaModel
        .findOne({ _id: comunaId, regionId })
        .select('_id')
        .lean()
        .exec();
      if (!comunaExists) {
        throw new NotFoundException(
          'La comuna especificada no existe o no pertenece a la región indicada',
        );
      }

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

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { emailConfirmacion, ...userData } = createUsuarioDto;

      const newUser = new this.userModel({
        ...userData,
        regionId,
        comunaId,
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
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        nombreCompleto: newUser.nombreCompleto,
        email: newUser.email,
        rut: newUser.rut,
        telefono: newUser.telefono,
        fechaNacimiento: newUser.fechaNacimiento,
        direccion: newUser.direccion,
        regionId: newUser.regionId,
        comunaId: newUser.comunaId,
        destinatarios: newUser.destinatarios,
        transferencia: newUser.transferencia,
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error({
        message: 'Error creating user',
        rut: createUsuarioDto.rut,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
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
        nombres: user.nombres,
        apellidos: user.apellidos,
        nombreCompleto: user.nombreCompleto,
        email: user.email,
        rut: user.rut,
        telefono: user.telefono,
        fechaNacimiento: user.fechaNacimiento,
        direccion: user.direccion,
        regionId: user.regionId,
        comunaId: user.comunaId,
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
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
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
