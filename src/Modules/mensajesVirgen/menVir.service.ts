import { Injectable, NotFoundException } from '@nestjs/common';
import { MensajesVirgenRepository } from './menVir.repository';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class MensajesVirgenService {
  constructor(
    private readonly MensajesVirgenRepository: MensajesVirgenRepository,
    private readonly emailService: EmailService,
  ) {}

  async getMensajesVirgen() {
    return this.MensajesVirgenRepository.getMensajesVirgen();
  }

  async filterMSsjs() {
    return this.MensajesVirgenRepository.filterMSsjs();
  }

  async uploadImage(file: Express.Multer.File) {
    return await this.MensajesVirgenRepository.uploadImage(file);
  }
  async addMensajeVirgen(
    mensajeVirgen: Partial<MensajeAVirgen>,
    imgCloudinary: string | undefined,
  ) {
    return await this.MensajesVirgenRepository.addMensajeVirgen(
      mensajeVirgen,
      imgCloudinary,
    );
  }

  aprobado(id) {
    return this.MensajesVirgenRepository.aprobado(id);
  }

  async deleteMensajeVirgen(id: string): Promise<void> {
    try {
      // Primero, obtener el mensaje con la relación de usuario
      // Podemos crear un nuevo método en el repositorio para esto
      const mensaje = await this.obtenerMensajeConUsuario(id);

      if (!mensaje) {
        throw new NotFoundException('Mensaje no encontrado');
      }

      // Guardar la información del usuario antes de eliminar el mensaje
      const usuarioInfo = mensaje.usuario
        ? {
            idUser: mensaje.usuario.idUser,
            nombre: mensaje.usuario.nombre,
            email: mensaje.usuario.email,
          }
        : null;

      console.log(
        'Información de usuario capturada antes de eliminación:',
        usuarioInfo,
      );

      // Ahora eliminar el mensaje usando el método existente
      await this.MensajesVirgenRepository.deleteMensajeVirgen(id);

      // Si tenemos información del usuario, enviar el correo
      if (usuarioInfo && usuarioInfo.email) {
        console.log(`Enviando correo de notificación a ${usuarioInfo.email}`);

        const emailResult = await this.emailService.sendMessageRejectionEmail(
          usuarioInfo.email,
          usuarioInfo.nombre || 'Usuario',
        );

        console.log(
          `Resultado de envío de correo: ${emailResult ? 'Éxito' : 'Fallo'}`,
        );
      } else {
        console.log(
          'No se encontró información de correo para enviar notificación',
        );
      }
    } catch (error) {
      console.error('Error en el proceso de eliminación:', error);
      throw new NotFoundException(
        'Error al procesar la eliminación del mensaje',
      );
    }
  }

  // Método auxiliar para obtener el mensaje con el usuario y poder enviar la notificacion de msj rechazado
  private async obtenerMensajeConUsuario(
    id: string,
  ): Promise<MensajeAVirgen | null> {
    try {
      // Usar el nuevo método del repositorio
      return await this.MensajesVirgenRepository.getMensajeConUsuario(id);
    } catch (error) {
      console.error('Error al obtener mensaje con usuario:', error);
      return null;
    }
  }

  async updateMensajeVirgen(
    id: string,
    mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    await this.MensajesVirgenRepository.updateMensajeVirgen(id, mensajeVirgen);
  }
}
