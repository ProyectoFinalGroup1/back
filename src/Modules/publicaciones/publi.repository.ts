import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Publicacion } from 'src/Entities/publicaciones.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';

@Injectable()
export class PublicacionesRepository {
  constructor(
    @InjectRepository(Publicacion)
    private publicacionesRepository: Repository<Publicacion>,
    @InjectRepository(Inhumado)
    private inhumadosRepository: Repository<Inhumado>,
  ) {}

  async addPublicacion(publicacion: Partial<Publicacion>): Promise<string> {
    const nuevaPublicacion = await this.publicacionesRepository.save(publicacion);
    return nuevaPublicacion.id;
  }

  async getPublicacionesByInhumado(nombre: string): Promise<Publicacion[]> {
    const inhumado = await this.inhumadosRepository.findOne({
      where: { nombre },
      relations: ['publicaciones'],
    });

    if (!inhumado) {
      throw new NotFoundException('No se encontró el inhumado con ese nombre');
    }

    return inhumado.publicaciones;
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
