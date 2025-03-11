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
      const mensaje =
        await this.MensajesVirgenRepository.getMensajeConUsuario(id);

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

        try {
          const emailResult = await this.emailService.sendMessageRejectionEmail(
            usuarioInfo.email,
            usuarioInfo.nombre || 'Usuario',
          );

          console.log(
            `Resultado de envío de correo: ${emailResult ? 'Éxito' : 'Fallo'}`,
          );
        } catch (emailError) {
          console.error(
            'Error al enviar el correo de notificación:',
            emailError,
          );
          // No lanzamos el error para no interrumpir el flujo principal si el correo falla
        }
      } else {
        console.log(
          'No se encontró información de correo para enviar notificación',
        );
      }
    } catch (error) {
      console.error('Error en el proceso de eliminación:', error);
      throw new Error(
        `Error al procesar la eliminación del mensaje: ${error.message}`,
      );
    }
  }

  async updateMensajeVirgen(
    id: string,
    mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    await this.MensajesVirgenRepository.updateMensajeVirgen(id, mensajeVirgen);
  }
}
