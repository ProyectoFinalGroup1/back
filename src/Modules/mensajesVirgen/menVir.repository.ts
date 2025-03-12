import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { User } from 'src/Entities/user.entity';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { EmailService } from '../email/email.service';

@Injectable()
export class MensajesVirgenRepository {
  constructor(
    @InjectRepository(MensajeAVirgen)
    private mensajesVirgenRepository: Repository<MensajeAVirgen>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

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

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('El archivo no tiene contenido válido');
    }
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'mensajesAVirgen' }, (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result)
            return reject(new Error('Hubo un error en la respuesta'));
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  async addMensajeVirgen(
    id: string,
    mensajeVirgen: string,
    imgCloudinary: string | undefined,
  ) {
    const existingUser = await this.userRepository.findOne({
      where: { idUser: id },
    });
    if (!existingUser) throw new NotFoundException('No se encontro a Usuario');
    if (!mensajeVirgen) throw new BadRequestException('Texto invalido');
    const newMSJ = new MensajeAVirgen();
    newMSJ.usuario = existingUser;
    newMSJ.texto = mensajeVirgen;
    newMSJ.fechaPublicacion = new Date();
    newMSJ.imagenUrl = imgCloudinary;
    newMSJ.estado = false;
    const result = await this.mensajesVirgenRepository.save(newMSJ);
    return result.id;
  }

  async aprobado(id) {
    const existingMsj = await this.mensajesVirgenRepository.findOne({
      where: { id: id },
      relations: ['usuario'],
    });
    if (!existingMsj) throw new NotFoundException('No se encontro mensaje');
    existingMsj.estado = true;
    const email = existingMsj.usuario.email;
    await this.emailService.sendApprovalEmail(
      email,
      existingMsj.usuario.nombre,
    );

    return await this.mensajesVirgenRepository.save(existingMsj);
  }

  async deleteMensajeVirgen(id: string): Promise<string> {
    const mensajeVirgen = await this.mensajesVirgenRepository.findOne({
      where: { id: id },
      relations: ['usuario'],
    });

    if (!mensajeVirgen) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const email = mensajeVirgen.usuario.email;
    await this.emailService.sendRejectionEmail(
      email,
      mensajeVirgen.usuario.nombre,
    );
    await this.mensajesVirgenRepository.remove(mensajeVirgen);
    return `eliminado mensaje ${id}`;
  }

  async updateMensajeVirgen(
    id: string,
    mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    const menVir = await this.mensajesVirgenRepository.findOneBy({ id });

    if (!menVir) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (menVir.estado) {
      throw new BadRequestException(
        'No se puede editar una publicación aprobada',
      );
    }

    await this.mensajesVirgenRepository.update(id, mensajeVirgen);
    const updatePublicacion = await this.mensajesVirgenRepository.findOneBy({
      id,
    });
    return updatePublicacion?.id;
  }
}
