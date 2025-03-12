import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from 'src/Entities/publicaciones.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { User } from 'src/Entities/user.entity';
// import { CreatePublicacionDto } from '../DTO/publicacionDto';
import { v2 as cloudinary } from 'cloudinary';
import { EmailService } from '../email/email.service';

@Injectable()
export class PublicacionesRepository {
  constructor(
    @InjectRepository(Publicacion)
    private publicacionesRepository: Repository<Publicacion>,
    @InjectRepository(Inhumado)
    private inhumadosRepository: Repository<Inhumado>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailService: EmailService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async getPublicacionesByInhumado(nombre: string): Promise<Publicacion[]> {
    const publicaciones = await this.publicacionesRepository.find({
      where: {
        inhumado: { nombre },
        aprobada: true, // Solo publicaciones aprobadas
      },
      relations: ['inhumado', 'usuario'],
    });

    if (!publicaciones.length) {
      throw new NotFoundException(
        'No se encontró el inhumado con ese nombre o no tiene publicaciones aprobadas',
      );
    }

    return publicaciones;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('El archivo no tiene contenido válido');
    }
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'publicaciones' }, (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result)
            return reject(new Error('Hubo un error en la respuesta'));
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  async addPublicacion(
    publicacionDto: { usuarioId: string; inhumadoId: string; mensaje: string },
    ImgCloudinary,
  ): Promise<string> {
    const { usuarioId, inhumadoId, mensaje } = publicacionDto;

    if (!mensaje || mensaje.trim() === '') {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    const existingUser = await this.userRepository.findOne({
      where: { idUser: usuarioId },
    });
    if (!existingUser) {
      throw new NotFoundException('No se encontro usuario');
    }
    const existingInhumado = await this.inhumadosRepository.findOne({
      where: { id: inhumadoId },
    });
    if (!existingInhumado) {
      throw new NotFoundException('No se encontro inhumado');
    }
    if (!mensaje) {
      throw new BadRequestException('Publicacion is undefined');
    }
    const nuevaPublicacion = new Publicacion();
    nuevaPublicacion.usuario = existingUser;
    nuevaPublicacion.inhumado = existingInhumado;
    nuevaPublicacion.mensaje = mensaje;
    nuevaPublicacion.imagen = ImgCloudinary;
    nuevaPublicacion.aprobada = false;
    nuevaPublicacion.fechaPublicacion = new Date();
    const savePublicacion =
      await this.publicacionesRepository.save(nuevaPublicacion);
    return savePublicacion.id;
  }

  async aprobarPublicacion(id: string): Promise<Publicacion | null> {
    const publicacion = await this.publicacionesRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });

    if (!publicacion) {
      throw new NotFoundException('No se encontro publicacion');
    }

    publicacion.aprobada = true;

    const email = publicacion.usuario.email;
    await this.emailService.sendApprovalEmail(
      email,
      publicacion.usuario.nombre,
    );
    return await this.publicacionesRepository.save(publicacion);
  }

  async deletePublicacion(id: string): Promise<string> {
    const publicacion = await this.publicacionesRepository.findOne({
      where: { id: id },
      relations: ['usuario'],
    });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const email = publicacion.usuario.email;
    await this.emailService.sendRejectionEmail(
      email,
      publicacion.usuario.nombre,
    );
    await this.publicacionesRepository.remove(publicacion);
    return id;
  }

  //
  async pendientes() {
    const allPublicaciones = await this.publicacionesRepository.find();
    const publicacionesPendientes = allPublicaciones.filter(
      (pub) => pub.aprobada === false,
    );
    if (publicacionesPendientes.length <= 0) {
      throw new NotFoundException('No hay publicaciones pendientes ');
    }
    return publicacionesPendientes;
  }

  async allPub() {
    const publicaciones = await this.publicacionesRepository.find();
    if (!publicaciones)
      throw new NotFoundException('No se encontraron publicaciones ');
    const aprobadas = publicaciones.filter((pub) => pub.aprobada === true);
    const pendientes = publicaciones.filter((pub) => pub.aprobada === false);

    return {
      Aprobadas: aprobadas,
      Pendientes: pendientes,
    };
  }

  async updatePublicacion(id: string, newPublicacion, ImgCloudinary) {
    const publicacion = await this.publicacionesRepository.findOneBy({ id });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    publicacion.mensaje = newPublicacion.mensaje;
    publicacion.aprobada = false;
    if (ImgCloudinary !== null) {
      publicacion.imagen = ImgCloudinary;
    }
    const result = await this.publicacionesRepository.update(id, publicacion);
    if (result.affected === 0) {
      throw new BadRequestException('Hubo un error al cargar los datos');
    }

    return 'Publicacion modificado con exito a la espera de su confirmacion';
  }

  async misPublicaciones(id: string) {
    const user = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['publicaciones'],
    });
    if (!user || !user.publicaciones?.length) {
      throw new NotFoundException(
        'No se encontraron publicaciones para este usuario',
      );
    }

    return user.publicaciones;
  }
}
