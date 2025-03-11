import { Injectable, NotFoundException } from '@nestjs/common';
import { MensajesVirgenRepository } from './menVir.repository';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';

@Injectable()
export class MensajesVirgenService {
  constructor(
    private readonly MensajesVirgenRepository: MensajesVirgenRepository,
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
    id: string,
    mensajeVirgen: string,
    imgCloudinary: string | undefined,
  ) {
    return await this.MensajesVirgenRepository.addMensajeVirgen(
      id,
      mensajeVirgen,
      imgCloudinary,
    );
  }

  aprobado(id) {
    return this.MensajesVirgenRepository.aprobado(id);
  }

  async deleteMensajeVirgen(id: string): Promise<void> {
    const result = await this.MensajesVirgenRepository.deleteMensajeVirgen(id);
    if (!result) {
      throw new NotFoundException('El mensaje a la virgen no encontrada');
    }
  }

  async updateMensajeVirgen(
    id: string,
    mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    await this.MensajesVirgenRepository.updateMensajeVirgen(id, mensajeVirgen);
  }
}
