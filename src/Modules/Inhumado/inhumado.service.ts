import { Injectable, NotFoundException } from '@nestjs/common';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { inhumadosRepository } from './inhumado.repository';
import { CreateInhumadoDto } from '../DTO/createInhumadoDto';

@Injectable()
export class inhumadosService {
  constructor(private readonly InhumadosRepository: inhumadosRepository) {}

  seed() {
    return this.InhumadosRepository.seed();
  }

  async allInhumados(): Promise<Inhumado[]> {
    return this.InhumadosRepository.allInhumados();
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.InhumadosRepository.uploadImage(file);
  }

  async addInhumado(inhumado: CreateInhumadoDto, ImgCloudinary: string) {
    return await this.InhumadosRepository.addInhumado(inhumado, ImgCloudinary);
  }

  async getInhumadoById(id): Promise<Inhumado> {
    const inhumado = await this.InhumadosRepository.getInhumadoById(id);
    if (!inhumado) {
      throw new NotFoundException('Inhumado no existente');
    }
    return inhumado;
  }

  async getInhumadoByNombreApellido(
    nombre: string,
    apellido: string,
  ): Promise<Inhumado> {
    const inhumado = await this.InhumadosRepository.getInhumadoByNombreApellido(
      nombre,
      apellido,
    );
    if (!inhumado) {
      throw new NotFoundException('Inhumado no existente');
    }
    return inhumado;
  }

  async getInhumadosByValle(valle: string): Promise<Inhumado[]> {
    return await this.InhumadosRepository.getInhumadosByValle(valle);
  }

  updateInhumado(id: string, inhumado: Partial<Inhumado>) {
    return this.InhumadosRepository.updateInhumado(id, inhumado);
  }

  deleteInhumado(id: string): Promise<{ message: string }> {
    return this.InhumadosRepository.deleteInhumado(id);
  }
}
