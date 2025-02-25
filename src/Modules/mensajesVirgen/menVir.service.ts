import { Injectable, NotFoundException } from "@nestjs/common";
import { MensajesVirgenRepository } from "./menVir.repository";
import { MensajeAVirgen } from "src/Entities/mensajesVirgen.entity";




@Injectable()
export class MensajesVirgenService {
  constructor(private readonly MensajesVirgenRepository: MensajesVirgenRepository) {}

  async getMensajesVirgen(){
    return this.MensajesVirgenRepository.getMensajesVirgen()
  }

    async addMensajeVirgen(mensajeVirgen: MensajeAVirgen){
      return await this.MensajesVirgenRepository.addMensajeVirgen(mensajeVirgen);
    }
  
  
    async deleteMensajeVirgen(id: string): Promise<void> {
      const result = await this.MensajesVirgenRepository.deleteMensajeVirgen(id);
      if (!result) {
        throw new NotFoundException('El mensaje a la virgen no encontrada');
      }
    }
}