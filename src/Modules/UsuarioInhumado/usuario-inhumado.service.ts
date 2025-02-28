// src/Modules/UsuarioInhumado/usuario-inhumado.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioInhumado } from 'src/Entities/usuario-inhumado.entity';
import { User } from 'src/Entities/user.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { CrearUsuarioInhumadoDto } from './crear-usuario-inhumado.dto';

@Injectable()
export class UsuarioInhumadoService {
  constructor(
    @InjectRepository(UsuarioInhumado)
    private usuarioInhumadoRepository: Repository<UsuarioInhumado>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Inhumado)
    private inhumadoRepository: Repository<Inhumado>,
  ) {}

  async crearAsociacion(
    dto: CrearUsuarioInhumadoDto,
  ): Promise<UsuarioInhumado> {
    const { usuarioId, inhumadoId } = dto;

    // Verificar si el usuario existe
    const usuario = await this.userRepository.findOne({
      where: { idUser: usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Verificar si el inhumado existe
    const inhumado = await this.inhumadoRepository.findOne({
      where: { id: inhumadoId },
    });
    if (!inhumado) {
      throw new NotFoundException(
        `Inhumado con ID ${inhumadoId} no encontrado`,
      );
    }

    // Verificar si ya existe la asociación
    const asociacionExistente = await this.usuarioInhumadoRepository.findOne({
      where: {
        usuario: { idUser: usuarioId },
        inhumado: { id: inhumadoId },
      },
      relations: ['usuario', 'inhumado'],
    });

    if (asociacionExistente) {
      throw new BadRequestException('Esta asociación ya existe');
    }

    // Crear la nueva asociación
    const nuevaAsociacion = this.usuarioInhumadoRepository.create({
      usuario,
      inhumado,
    });

    return this.usuarioInhumadoRepository.save(nuevaAsociacion);
  }

  async eliminarAsociacion(id: string): Promise<void> {
    const asociacion = await this.usuarioInhumadoRepository.findOne({
      where: { id },
    });

    if (!asociacion) {
      throw new NotFoundException(`Asociación con ID ${id} no encontrada`);
    }

    await this.usuarioInhumadoRepository.remove(asociacion);
  }

  async obtenerInhumadosPorUsuario(usuarioId: string): Promise<Inhumado[]> {
    const asociaciones = await this.usuarioInhumadoRepository.find({
      where: { usuario: { idUser: usuarioId } },
      relations: ['inhumado'],
    });

    return asociaciones.map((asociacion) => asociacion.inhumado);
  }

  async obtenerUsuariosPorInhumado(inhumadoId: string): Promise<User[]> {
    const asociaciones = await this.usuarioInhumadoRepository.find({
      where: { inhumado: { id: inhumadoId } },
      relations: ['usuario'],
    });

    return asociaciones.map((asociacion) => asociacion.usuario);
  }
}
