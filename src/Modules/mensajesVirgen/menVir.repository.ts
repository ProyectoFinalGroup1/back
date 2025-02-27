import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { User } from 'src/Entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MensajesVirgenRepository {
  constructor(
    @InjectRepository(MensajeAVirgen)
    private mensajesVirgenRepository: Repository<MensajeAVirgen>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async getMensajesVirgen(): Promise<MensajeAVirgen[]> {
    return this.mensajesVirgenRepository.find();
  }

  async filterMSsjs() {
    const msjs = await this.mensajesVirgenRepository.find();
    if (!msjs) throw new NotFoundException('No se encontraron mensajes ');
    const aprobadas = msjs.filter((msj) => msj.estado === true);
    const pendientes = msjs.filter((msj) => msj.estado === false);
    return {
      Aprobadas: aprobadas,
      Pendientes: pendientes,
    };
  }
  async addMensajeVirgen(mensajeVirgen: Partial<MensajeAVirgen>) {
    const { usuario, texto, imagenUrl } = mensajeVirgen;
    const existingUser = await this.userRepository.findOne({
      where: { idUser: usuario?.idUser },
    });
    if (!existingUser) throw new NotFoundException('No se encontro a Usuario');
    if (!texto) throw new BadRequestException('Texto invalido');
    const newMSJ = new MensajeAVirgen();
    newMSJ.usuario = existingUser;
    newMSJ.texto = texto;
    newMSJ.fechaPublicacion = new Date();
    newMSJ.imagenUrl = imagenUrl ?? undefined;
    newMSJ.estado = false;
    const result = await this.mensajesVirgenRepository.save(newMSJ);
    return result.id;
  }

  async aprobado(id) {
    const existingMsj = await this.mensajesVirgenRepository.findOne({
      where: { id: id },
    });
    if (!existingMsj) throw new NotFoundException('No se encontro mensaje');
    existingMsj.estado = true;
    return await this.mensajesVirgenRepository.save(existingMsj);
  }

  async deleteMensajeVirgen(id: string): Promise<string> {
    const mensajeVirgen = await this.mensajesVirgenRepository.findOne({
      where: { id: id },
    });

    if (!mensajeVirgen) {
      throw new NotFoundException('Publicación no encontrada');
    }

    await this.mensajesVirgenRepository.remove(mensajeVirgen);
    return `eliminado mensaje ${id}`;
  }

  async updateMensajeVirgen(id: string, mensajeVirgen: Partial <MensajeAVirgen>){
      const menVir = await this.mensajesVirgenRepository.findOneBy({ id });
      
      if (!menVir) {
        throw new NotFoundException('Publicación no encontrada');
      }
  
      if (menVir.estado) {
        throw new BadRequestException('No se puede editar una publicación aprobada');
      }
  
      await this.mensajesVirgenRepository.update(id, mensajeVirgen)
      const updatePublicacion = await this.mensajesVirgenRepository.findOneBy({id})
      return updatePublicacion?.id
    }
}
