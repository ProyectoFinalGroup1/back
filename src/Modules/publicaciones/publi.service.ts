import { Injectable, NotFoundException } from '@nestjs/common';
import { PublicacionesRepository } from './publi.repository';
import { Publicacion } from 'src/Entities/publicaciones.entity';
import { CreatePublicacionDto } from '../DTO/publicacionDto';

@Injectable()
export class PublicacionesService {
  constructor(
    private readonly publicacionesRepository: PublicacionesRepository,
  ) {}

  async getPublicacionesByInhumado(nombre: string): Promise<Publicacion[]> {
    const publicaciones =
      await this.publicacionesRepository.getPublicacionesByInhumado(nombre);
    if (!publicaciones.length) {
      throw new NotFoundException(
        'No se encontraron publicaciones para el inhumado especificado',
      );
    }
    return publicaciones;
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.publicacionesRepository.uploadImage(file);
  }

  async addPublicacion(
    publicacionDto: CreatePublicacionDto,
    ImgCloudinary: string | undefined,
  ): Promise<string> {
    return await this.publicacionesRepository.addPublicacion(
      publicacionDto,
      ImgCloudinary,
    );
  }

  aprobarPublicacion(id: string) {
    return this.publicacionesRepository.aprobarPublicacion(id);
  }

  deletePublicacion(id: string) {
    return this.publicacionesRepository.deletePublicacion(id);
  }

  //
  pendientes() {
    return this.publicacionesRepository.pendientes();
  }

  allPublication() {
    return this.publicacionesRepository.allPub();
  }

  async updatePublicacion(id: string, newPublicacion, ImgCloudinary) {
    return await this.publicacionesRepository.updatePublicacion(
      id,
      newPublicacion,
      ImgCloudinary,
    );
  }

  async misPublicaciones(id: string) {
    return await this.publicacionesRepository.misPublicaciones(id);
  }
  ///
}
