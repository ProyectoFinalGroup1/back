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
  addMensajeVirgen(mensajeVirgen: Partial<MensajeAVirgen>) {
    return this.MensajesVirgenRepository.addMensajeVirgen(mensajeVirgen);
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
}
