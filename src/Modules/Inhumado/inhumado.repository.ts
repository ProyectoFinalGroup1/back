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

interface AsociacionCount {
  count: string;
}
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
    const existingInhumado = await this.inhumadosRepository.findOne({
        where: { id },
        relations: ['publicaciones'], // 🔹 Asegurar que traemos las relaciones
    });

    if (!existingInhumado) {
        throw new NotFoundException('Inhumado no encontrado');
    }

    // 🔹 Filtrar datos para evitar actualizar la relación `publicaciones`
    const { publicaciones, ...updateData } = inhumado;  

    // 🔹 Aplicar solo los cambios permitidos
    Object.assign(existingInhumado, updateData); 

    return await this.inhumadosRepository.save(existingInhumado);
}

  // Define una interfaz para el resultado de la consulta(se agrega por el error/advertencia de tipado)

  async deleteInhumado(id: string): Promise<{ message: string }> {
    const inhumado = await this.inhumadosRepository.findOne({
      where: { id },
    });

    if (!inhumado) {
      throw new NotFoundException('Inhumado no encontrado');
    }

    // Verificar si tiene asociaciones en la tabla usuario_inhumado
    const asociaciones = await this.inhumadosRepository.manager.query<
      AsociacionCount[]
    >(`SELECT COUNT(*) as count FROM usuario_inhumado WHERE inhumado_id = $1`, [
      id,
    ]);

    // Validar y convertir el resultado de forma segura
    if (!asociaciones || !asociaciones[0]) {
      throw new Error('Error al consultar asociaciones');
    }

    const countValue = asociaciones[0].count;
    const cantidadAsociaciones =
      typeof countValue === 'string'
        ? parseInt(countValue, 10)
        : typeof countValue === 'number'
          ? countValue
          : 0;

    if (cantidadAsociaciones > 0) {
      console.error(
        `No se puede eliminar el inhumado ${id} porque tiene ${cantidadAsociaciones} asociaciones con usuarios`,
      );
      throw new BadRequestException(
        `No se puede eliminar el inhumado porque tiene ${cantidadAsociaciones} asociaciones con usuarios. ` +
          `Debe eliminar estas asociaciones primero usando la ruta DELETE /usuario-inhumado/{id_asociacion}.`,
      );
    }

    try {
      await this.inhumadosRepository.remove(inhumado);
      return { message: `Inhumado id: ${id} fue eliminado exitosamente` };
    } catch (error) {
      console.error('Error al eliminar inhumado:', error);
      if (error.code === '23503') {
        // Error de clave foránea
        throw new BadRequestException(
          'No se puede eliminar este inhumado porque está siendo referenciado en otras tablas. ' +
            'Debe eliminar primero todas las referencias a este inhumado.',
        );
      }
      throw new BadRequestException(
        'Error al eliminar inhumado: ' + error.message,
      );
    }
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
