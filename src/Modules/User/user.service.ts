import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import { UpdateUserPreferencesDto } from '../DTO/UpdateUserPreferencesDto';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { Donacion } from 'src/Entities/donacion.entity';

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class userService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Donacion)
    private readonly donacionRepository: Repository<Donacion>,
    private datasource: DataSource,
  ) {}

  async getUsers(): Promise<User[] | NotFoundException> {
    const allUsers = await this.userRepository.find();
    if (!allUsers) {
      throw new NotFoundException('No se encontraron los usuarios ');
    }
    return allUsers;
  }

  async userFind(id: string): Promise<User | NotFoundException> {
    const result = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['usuario-inhumado', 'inhumados', 'publicaciones'],
    });
    if (!result) throw new NotFoundException('No se encontro usuario');
    return result;
  }

  //FUNCION USUARIO
  async allUserAdmin(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        idUser: id,
      },
      relations: [
        'publicaciones',
        'usuarioInhumados',
        'usuarioInhumados.inhumado',
        'mensajesAVirgen',
      ],
    });
    if (!user) throw new NotFoundException('No se encontro usuario');
    return {
      Usuario: {
        idUser: user.idUser,
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        phoneNumber: user.phoneNumber,
        email: user.email,
        imagenUrl: user.imagenUrl,
        fechaPago: user.fechaPago,
        recibirRecordatoriosAniversarios: user.recibirRecordatoriosAniversarios,
        isAdmin: user.isAdmin,
      },
      publicaciones: user.publicaciones,
      mensajes: user.mensajesAVirgen,
      relaciones: user.usuarioInhumados.map((rel) => ({
        id: rel.inhumado?.id,
        apellido: rel.inhumado?.apellido,
        nombre: rel.inhumado?.nombre,
        fnac: rel.inhumado?.fnac,
        ffal: rel.inhumado?.ffal,
        valle: rel.inhumado?.valle,
        sector: rel.inhumado?.sector,
        imagenUrl: rel.inhumado?.imagenUrl,
        manzana: rel.inhumado?.manzana,
        parcela: rel.inhumado?.parcela,
        simbolo: rel.inhumado?.simbolo,
        ncliente: rel.inhumado?.ncliente,
        usuario_id: rel.usuario?.idUser ?? null,
      })),
    };
  }
  ////////
  async updateUser(idUser: string, dataUser: Partial<User>): Promise<User> {
    const findUser = await this.userRepository.findOneBy({ idUser });
    if (!findUser) {
      throw new NotFoundException('No se encontro el usuario');
    }
    const updateUser = Object.assign(findUser, dataUser);
    return await this.userRepository.save(updateUser);
  }

  async deleteUser(id: string) {
    try {
      const findUser = await this.userRepository.findOne({
        where: { idUser: id },
      });
      if (!findUser) {
        throw new NotFoundException('No se encontro usuario');
      }
      const deleteUser = await this.userRepository.remove(findUser);
      if (!deleteUser) {
        throw new BadRequestException('No se pudo eliminar usuario');
      }
      return id;
    } catch (error) {
      // Verificar si es un error de clave foránea
      if (error?.code === '23503') {
        // Verificar a qué tabla hace referencia la restricción
        if (error?.detail?.includes('donacion')) {
          throw new BadRequestException(
            'Este usuario no puede ser eliminado ya que tiene donaciones asociadas. Use la opción "delete-user-with-donations" para eliminarlo junto con sus donaciones.',
          );
        } else if (error?.detail?.includes('publicaciones')) {
          throw new BadRequestException(
            'Este usuario no puede ser eliminado ya que tiene publicaciones asociadas. Elimine primero las publicaciones del usuario.',
          );
        } else if (error?.detail?.includes('inhumado')) {
          throw new BadRequestException(
            'Este usuario no puede ser eliminado ya que tiene un inhumado asociado. Elimine primero las asociaciones del usuario.',
          );
        } else {
          // Para cualquier otra restricción de clave foránea
          throw new BadRequestException(
            `Este usuario no puede ser eliminado ya que tiene registros asociados en la tabla "${error?.table}". Elimine primero estos registros.`,
          );
        }
      }

      // Si no es un error de clave foránea, vuelve a lanzar el error original
      throw error;
    }
  }

  async deleteUserWithDonations(id: string) {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const findUser = await this.userRepository.findOne({
        where: { idUser: id },
      });
      if (!findUser) {
        throw new NotFoundException('No se encontro usuario');
      }

      // Esto es más flexible y funcionará con relaciones
      const donaciones = await queryRunner.manager.find(Donacion, {
        where: {
          DonacionUser: { idUser: id },
        },
      });

      // Eliminar cada donación encontrada
      for (const donacion of donaciones) {
        await queryRunner.manager.remove(donacion);
      }

      // Luego elimina el usuario
      await queryRunner.manager.remove(findUser);

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: `Usuario con id ${id} y sus donaciones relacionadas han sido eliminados`,
        userId: id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) {
        throw new NotFoundException(err.message);
      }
      throw new BadRequestException(
        `No se pudo eliminar el usuario con sus donaciones: ${err.message || 'Error desconocido'}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  // Método para actualizar las preferencias de notificaciones de un usuario
  async updatePreferences(
    idUser: string,
    preferencesDto: UpdateUserPreferencesDto,
  ): Promise<User> {
    const findUser = await this.userRepository.findOneBy({ idUser });

    if (!findUser) {
      throw new NotFoundException(`Usuario con ID ${idUser} no encontrado`);
    }

    // Actualizar solo las preferencias enviadas
    if (preferencesDto.recibirRecordatoriosAniversarios !== undefined) {
      findUser.recibirRecordatoriosAniversarios =
        preferencesDto.recibirRecordatoriosAniversarios;
    }

    if (preferencesDto.fechaPago !== undefined) {
      findUser.fechaPago = preferencesDto.fechaPago;
    }

    return await this.userRepository.save(findUser);
  }

  async uploadImgPerfil(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ imageUrl: string }> {
    // Verificar si el archivo es válido
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'No se ha proporcionado un archivo válido.',
      );
    }

    // Buscar el user en la base de datos
    const user = await this.userRepository.findOneBy({
      idUser: userId,
    });

    if (!user) {
      throw new NotFoundException(`User con ID ${userId} no encontrado`);
    }

    // Subir la imagen a Cloudinary
    let result: CloudinaryResponse;
    try {
      result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'users',
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
        `Error al subir la imagen: ${error instanceof Error ? error.message : 'Error desconocido'},
      `,
      );
    }

    // Verificar que la respuesta de Cloudinary contenga los campos esperados
    if (!result.secure_url || !result.public_id) {
      throw new Error(
        'La respuesta de Cloudinary no contiene la información esperada.',
      );
    }

    // Guardar la URL de la imagen en el inhumado
    user.imagenUrl = result.secure_url;
    await this.userRepository.save(user);

    return { imageUrl: result.secure_url };
  }

  async updateImgPerfil(
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ imageUrl: string }> {
    // Verificar si el archivo es válido
    if (!file || !file.buffer) {
      throw new BadRequestException(
        'No se ha proporcionado un archivo válido.',
      );
    }

    // Buscar el usuario en la base de datos
    const user = await this.userRepository.findOneBy({ idUser: userId });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    // Subir la nueva imagen a Cloudinary
    let result: CloudinaryResponse;
    try {
      result = await new Promise<CloudinaryResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'users' },
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

    // Verificar que Cloudinary devuelva la URL correcta
    if (!result.secure_url || !result.public_id) {
      throw new Error('Error en la respuesta de Cloudinary.');
    }

    // **Eliminar imagen anterior si existe**
    if (user.imagenUrl) {
      const publicId = user.imagenUrl.split('/').pop()?.split('.')[0]; // Extrae el ID de la imagen anterior
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`users/${publicId}`);
        } catch (error) {
          console.warn('Error al eliminar imagen anterior:', error);
        }
      }
    }

    // Guardar la nueva URL de la imagen en el usuario
    user.imagenUrl = result.secure_url;
    await this.userRepository.save(user);

    return { imageUrl: result.secure_url };
  }
}
