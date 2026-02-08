import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../usuarios/schemas/user.schema';
import { CreateTransferenciaDto } from './dto/create-transferencia.dto';
import { TransferenciaResponseDto } from './dto/transferencia-response.dto';
import { ITransferencia } from '@common/interfaces/user.interface';

@Injectable()
export class TransferenciasService {
  private readonly logger = new Logger(TransferenciasService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  /**
   * Obtener historial de transferencias de un usuario
   */
  async findByRut(rut: string): Promise<TransferenciaResponseDto[]> {
    this.logger.log({
      message: 'Fetching transfer history',
      rut,
    });

    try {
      // Optimized query: select only needed field and use lean() for better performance
      const user = await this.userModel
        .findOne({ rut })
        .select('transferencia')
        .lean()
        .exec();

      if (!user) {
        this.logger.warn({
          message: 'User not found for fetching transfer history',
          rut,
        });
        throw new NotFoundException(`El cliente ${rut} no existe`);
      }

      if (!user.transferencia || user.transferencia.length === 0) {
        this.logger.log({
          message: 'No transfer history found',
          rut,
        });
        return [];
      }

      this.logger.log({
        message: 'Transfer history fetched successfully',
        rut,
        count: user.transferencia.length,
      });

      // Sort by date descending (most recent first)
      const sortedTransfers = (user.transferencia || []).sort(
        (a, b) =>
          new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime(),
      );

      return sortedTransfers.map(
        (trans) => new TransferenciaResponseDto(trans),
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error({
        message: 'Error fetching transfer history',
        rut,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Crear nueva transferencia
   */
  async create(
    createTransferenciaDto: CreateTransferenciaDto,
  ): Promise<boolean> {
    const { rut_cliente, rut_destinatario, monto } = createTransferenciaDto;

    this.logger.log({
      message: 'Creating new transfer',
      rut_cliente,
      rut_destinatario,
      monto,
    });

    try {
      const { rut_cliente, ...transferenciaData } = createTransferenciaDto;

      // Optimized: only check existence, no need to retrieve full document
      const userExists = await this.userModel
        .exists({ rut: rut_cliente })
        .lean()
        .exec();

      if (!userExists) {
        this.logger.warn({
          message: 'User not found for creating transfer',
          rut_cliente,
        });
        throw new NotFoundException(`El cliente ${rut_cliente} no existe`);
      }

      // Crear la transferencia
      const transferencia: ITransferencia = {
        nombre: transferenciaData.nombre,
        email: transferenciaData.email,
        rut_destinatario: transferenciaData.rut_destinatario,
        banco: transferenciaData.banco,
        tipo_cuenta: transferenciaData.tipo_cuenta,
        monto: transferenciaData.monto,
        fecha: new Date(),
      };

      const result = await this.userModel.updateOne(
        { rut: rut_cliente },
        { $push: { transferencia: transferencia } },
      );

      this.logger.log({
        message: 'Transfer created successfully',
        rut_cliente,
        rut_destinatario: transferenciaData.rut_destinatario,
        monto: transferenciaData.monto,
      });

      return result.modifiedCount > 0;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error({
        message: 'Error creating transfer',
        rut_cliente,
        rut_destinatario,
        monto,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
