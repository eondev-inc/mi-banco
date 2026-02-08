import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../usuarios/schemas/user.schema';
import { CreateDestinatarioDto } from './dto/create-destinatario.dto';
import { DestinatarioResponseDto } from './dto/destinatario-response.dto';
import { IDestinatario } from '@common/interfaces/user.interface';

@Injectable()
export class DestinatariosService {
  private readonly logger = new Logger(DestinatariosService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Obtener destinatarios de un usuario
   */
  async findByRut(rut: string): Promise<DestinatarioResponseDto[]> {
    this.logger.log({
      message: 'Fetching beneficiaries',
      rut,
    });

    try {
      // Optimized query: select only needed field and use lean() for better performance
      const user = await this.userModel
        .findOne({ rut })
        .select('destinatarios')
        .lean()
        .exec();

      if (!user) {
        this.logger.warn({
          message: 'User not found for fetching beneficiaries',
          rut,
        });
        throw new NotFoundException(`El cliente ${rut} no existe`);
      }

      if (!user.destinatarios || user.destinatarios.length === 0) {
        this.logger.log({
          message: 'No beneficiaries found',
          rut,
        });
        return [];
      }

      this.logger.log({
        message: 'Beneficiaries fetched successfully',
        rut,
        count: user.destinatarios.length,
      });

      return user.destinatarios.map(
        (dest) => new DestinatarioResponseDto(dest),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error({
        message: 'Error fetching beneficiaries',
        rut,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Agregar nuevo destinatario a un usuario
   */
  async create(createDestinatarioDto: CreateDestinatarioDto): Promise<boolean> {
    const { rut_cliente, rut_destinatario } = createDestinatarioDto;

    this.logger.log({
      message: 'Adding new beneficiary',
      rut_cliente,
      rut_destinatario,
    });

    try {
      const { rut_cliente, ...destinatarioData } = createDestinatarioDto;

      // Optimized: select only destinatarios field and use lean()
      const user = await this.userModel
        .findOne({ rut: rut_cliente })
        .select('destinatarios')
        .lean()
        .exec();

      if (!user) {
        this.logger.warn({
          message: 'User not found for adding beneficiary',
          rut_cliente,
        });
        throw new NotFoundException(`El cliente ${rut_cliente} no existe`);
      }

      // Verificar que el destinatario no existe ya
      const exists = user.destinatarios?.some(
        (dest) => dest.rut_destinatario === destinatarioData.rut_destinatario,
      );

      if (exists) {
        this.logger.warn({
          message: 'Beneficiary already exists',
          rut_cliente,
          rut_destinatario: destinatarioData.rut_destinatario,
        });
        throw new BadRequestException(
          `El destinatario con RUT ${destinatarioData.rut_destinatario} ya está registrado`,
        );
      }

      // Agregar destinatario
      const destinatario: IDestinatario = {
        nombre: destinatarioData.nombre,
        apellido: destinatarioData.apellido,
        email: destinatarioData.email,
        rut_destinatario: destinatarioData.rut_destinatario,
        telefono: destinatarioData.telefono,
        banco: destinatarioData.banco,
        tipo_cuenta: destinatarioData.tipo_cuenta,
        numero_cuenta: destinatarioData.numero_cuenta,
      };

      const result = await this.userModel.updateOne(
        { rut: rut_cliente },
        { $push: { destinatarios: destinatario } },
      );

      this.logger.log({
        message: 'Beneficiary added successfully',
        rut_cliente,
        rut_destinatario: destinatarioData.rut_destinatario,
      });

      return result.modifiedCount > 0;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error({
        message: 'Error adding beneficiary',
        rut_cliente,
        rut_destinatario,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
