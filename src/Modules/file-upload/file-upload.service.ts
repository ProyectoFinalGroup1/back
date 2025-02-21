// src/Modules/file-upload/file-upload.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inhumado } from '../../Entities/inhumados.entity';
const cloudinary = require('cloudinary').v2;

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
    const inhumado = await this.inhumadoRepository.findOneBy({
      id: inhumadoId,
    });

    if (!inhumado) {
      throw new NotFoundException(
        `Inhumado con ID ${inhumadoId} no encontrado`,
      );
    }

    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'inhumados',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const buffer = Buffer.from(file.buffer);
      uploadStream.end(buffer);
    });

    inhumado.imagenUrl = result.secure_url;
    await this.inhumadoRepository.save(inhumado);

    return { imageUrl: result.secure_url };
  }
}
