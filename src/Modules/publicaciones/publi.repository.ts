import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from 'src/Entities/publicaciones.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
// import { User } from 'src/Entities/user.entity';

@Injectable()
export class PublicacionesRepository {
  constructor(
    @InjectRepository(Publicacion)
    private publicacionesRepository: Repository<Publicacion>,
    @InjectRepository(Inhumado)
    private inhumadosRepository: Repository<Inhumado>,
  ) {}

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

  async addPublicacion(publicacion: Partial<Publicacion>): Promise<string> {
    if (!publicacion) {
      throw new Error('Publicacion is undefined');
    }
    const nuevaPublicacion =
      await this.publicacionesRepository.save(publicacion);
    return nuevaPublicacion.id;
  }

  async aprobarPublicacion(id: string): Promise<Publicacion | null> {
    const publicacion = await this.publicacionesRepository.findOne({
      where: { id },
    });

    if (!publicacion) {
      return null;
    }

    publicacion.aprobada = true;
    return await this.publicacionesRepository.save(publicacion);
  }

  async deletePublicacion(id: string): Promise<string> {
    const publicacion = await this.publicacionesRepository.findOneBy({ id });

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    await this.publicacionesRepository.remove(publicacion);
    return publicacion.id;
  }
}
