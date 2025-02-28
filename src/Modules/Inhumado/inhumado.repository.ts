import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { Repository } from 'typeorm';
import { seedInhumados } from './sedeer';
import { v2 as cloudinary } from 'cloudinary';
import { CreateInhumadoDto } from '../DTO/createInhumadoDto';

@Injectable()
export class inhumadosRepository {
  constructor(
    @InjectRepository(Inhumado)
    private inhumadosRepository: Repository<Inhumado>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('El archivo no tiene contenido válido');
    }
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'inhumados' }, (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result)
            return reject(new Error('Hubo un error en la respuesta'));
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }

  async addInhumado(inhumado: CreateInhumadoDto, ImgCloudinary: string) {
    const newInhumado = this.inhumadosRepository.create({
      ...inhumado,
      imagenUrl: ImgCloudinary,
    });
    if (!newInhumado)
      throw new BadRequestException('No se pudo crear inhumado');
    const savedInhumado = await this.inhumadosRepository.save(newInhumado);
    return savedInhumado.id;
  }

  async allInhumados(): Promise<Inhumado[]> {
    try {
      const allData = await this.inhumadosRepository.find();
      return allData;
    } catch (error) {
      console.error('Error al obtener los inhumados:', error);
      throw new Error('No se pudieron obtener los inhumados');
    }
  }

  async getInhumadoById(id) {
    const inhumado = await this.inhumadosRepository.findOne({
      where: { id },
      relations: ['publicaciones'],
    });
    if (!inhumado)
      throw new NotFoundException('No se encontro inhumado por el ID');
    inhumado.publicaciones = inhumado.publicaciones.filter(
      (pub) => pub.aprobada === true,
    );
    return inhumado;
  }

  async getInhumadoByNombreApellido(nombre: string, apellido: string) {
    return await this.inhumadosRepository.findOne({
      where: { nombre, apellido },
    });
  }

  async getInhumadosByValle(valle: string): Promise<Inhumado[]> {
    return await this.inhumadosRepository.find({ where: { valle } });
  }

  async updateInhumado(id: string, inhumado: Partial<Inhumado>) {
    await this.inhumadosRepository.update(id, inhumado);
    const updateInhumado = await this.inhumadosRepository.findOneBy({ id });
    return updateInhumado;
  }

  async deleteInhumado(id: string) {
    const inhumado = await this.inhumadosRepository.findOneBy({ id });

    if (!inhumado) {
      throw new NotFoundException('Inhumado no encontrado');
    }
    await this.inhumadosRepository.remove(inhumado);
    return id;
  }

  async seed() {
    const existingDates = await this.inhumadosRepository.count();
    if (existingDates > 100) {
      return { message: 'La base de datos ya cuenta con registros' };
    }
    const precarga = seedInhumados.map((persona) => {
      const carga = new Inhumado();
      carga.nombre = persona.nombre;
      carga.apellido = persona.apellido;
      carga.fnac = persona.fnac;
      carga.ffal = persona.ffal;
      carga.valle = persona.valle;
      carga.sector = persona.sector;
      carga.manzana = persona.manzana;
      carga.parcela = persona.parcela;
      carga.simbolo = persona.simbolo;
      carga.ncliente = persona.ncliente;
      return carga;
    });
    await this.inhumadosRepository.save(precarga);
    return { message: 'Seeder ejecutado con exito' };
  }
}
