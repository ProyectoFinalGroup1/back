import { Injectable, NotFoundException } from '@nestjs/common';
import { PublicacionesRepository } from './publi.repository';
import { Publicacion } from 'src/Entities/publicaciones.entity';

@Injectable()
export class PublicacionesService {
  constructor(private readonly publicacionesRepository: PublicacionesRepository) {}


  async getPublicacionesByInhumado(nombre: string): Promise<Publicacion[]> {
    const publicaciones = await this.publicacionesRepository.getPublicacionesByInhumado(nombre);
    if (!publicaciones.length) {
      throw new NotFoundException('No se encontraron publicaciones para el inhumado especificado');
    }
    return publicaciones;
  }

  async addPublicacion(publicacion: Publicacion): Promise<string> {
    return await this.publicacionesRepository.addPublicacion(publicacion);
  }


  async deletePublicacion(id: string): Promise<void> {
    const result = await this.publicacionesRepository.deletePublicacion(id);
    if (!result) {
      throw new NotFoundException('Publicación no encontrada');
    }
  }
}
