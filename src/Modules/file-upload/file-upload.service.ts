// src/Modules/file-upload/file-upload.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inhumado } from '../../Entities/inhumados.entity';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(Inhumado)
    private readonly inhumadoRepository: Repository<Inhumado>,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadInhumadoImage(
    file: Express.Multer.File,
    inhumadoId: string,
  ): Promise<{ imageUrl: string }> {
    // Verificar si el archivo es válido
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'No se ha proporcionado un archivo válido.',
      );
    }

    // Buscar el inhumado en la base de datos
    const inhumado = await this.inhumadoRepository.findOneBy({
      id: inhumadoId,
    });

    if (!inhumado) {
      throw new NotFoundException(
        `Inhumado con ID ${inhumadoId} no encontrado`,
      );
    }

    // Subir la imagen a Cloudinary
    let result: CloudinaryResponse;
    try {
      result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'inhumados',
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse,
          ) => {
            if (error) return reject(new Error(error.message));
            resolve(result);
          },
        );

        const buffer = Buffer.from(file.buffer);
        uploadStream.end(buffer);
      });
    } catch (error) {
      throw new Error(
        `Error al subir la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }

    // Verificar que la respuesta de Cloudinary contenga los campos esperados
    if (!result.secure_url || !result.public_id) {
      throw new Error(
        'La respuesta de Cloudinary no contiene la información esperada.',
      );
    }

    // Guardar la URL de la imagen en el inhumado
    inhumado.imagenUrl = result.secure_url;
    await this.inhumadoRepository.save(inhumado);

    return { imageUrl: result.secure_url };
  }
}
