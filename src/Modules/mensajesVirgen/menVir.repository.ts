import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MensajesVirgenRepository {
  constructor(
    @InjectRepository(MensajeAVirgen)
    private mensajesVirgenRepository: Repository<MensajeAVirgen>,
  ) {}

  async getMensajesVirgen(): Promise<MensajeAVirgen[]> {
    return this.mensajesVirgenRepository.find();
  }

  async addMensajeVirgen(mensajeVirgen: Partial<MensajeAVirgen>) {
    const nuevaPublicacion =
      await this.mensajesVirgenRepository.save(mensajeVirgen);
    return nuevaPublicacion.id;
  }

  async deleteMensajeVirgen(id: string): Promise<string> {
    const mensajeVirgen = await this.mensajesVirgenRepository.findOneBy({ id });

    if (!mensajeVirgen) {
      throw new NotFoundException('Publicación no encontrada');
    }

    await this.mensajesVirgenRepository.remove(mensajeVirgen);
    return mensajeVirgen.id;
  }
}
