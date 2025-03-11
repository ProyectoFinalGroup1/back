import { Injectable, NotFoundException } from '@nestjs/common';
import { MensajesVirgenRepository } from './menVir.repository';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class MensajesVirgenService {
  constructor(
    private readonly MensajesVirgenRepository: MensajesVirgenRepository,
    private readonly emailService: EmailService,
  ) {}

  async getMensajesVirgen() {
    return this.MensajesVirgenRepository.getMensajesVirgen();
  }

  async filterMSsjs() {
    return this.MensajesVirgenRepository.filterMSsjs();
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.MensajesVirgenRepository.uploadImage(file);
  }
  async addMensajeVirgen(
    mensajeVirgen: Partial<MensajeAVirgen>,
    imgCloudinary: string | undefined,
  ) {
    return await this.MensajesVirgenRepository.addMensajeVirgen(
      mensajeVirgen,
      imgCloudinary,
    );
  }

  aprobado(id) {
    return this.MensajesVirgenRepository.aprobado(id);
  }

  async deleteMensajeVirgen(id: string): Promise<void> {
    try {
      const result =
        await this.MensajesVirgenRepository.deleteMensajeVirgen(id);
      //Enviamos el correo para notificar al usuario del rechazo de su mensaje a la virgen
      if (result.usuario && result.usuario.email) {
        await this.emailService.sendMessageRejectionEmail(
          result.usuario.email,
          result.usuario.nombre || 'Usuario',
        );
      }
    } catch (error) {
      console.error('Error al eliminar mensaje a la virgen:', error);
      throw new NotFoundException(
        'El mensaje a la virgen no encontrado o no se pudo eliminar',
      );
    }
  }

  async updateMensajeVirgen(
    id: string,
    mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    await this.MensajesVirgenRepository.updateMensajeVirgen(id, mensajeVirgen);
  }
}
