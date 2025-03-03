import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verificar la conexión al iniciar
    // this.verifyConnection().catch((error) => {
    //   this.logger.error('Error al conectar con servidor de correo:', error);
    //   throw new InternalServerErrorException(
    //     'Error al configurar el servicio de correo',
    //   );
    // });
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('Conexión con servidor de correo establecida');
    } catch (error) {
      this.logger.error('Error al conectar con servidor de correo:', error);
      throw new InternalServerErrorException(
        'Error al configurar el servicio de correo',
      );
    }
  }

  async sendWelcomeEmail(email: string, nombre: string) {
    try {
      const mailOptions = {
        from: `"Cementerio Valle de Paz" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Bienvenido al Cementerio Parque Valle de Paz',
        html: `
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <img src="https://raw.githubusercontent.com/ProyectoFinalGroup1/front/develop/public/images/logo.jpg" alt="Logo Cementerio" style="max-width: 200px;">
            <h1 style="color: #333;">¡Bienvenido ${nombre}!</h1>
            <p style="color: #666; font-size: 16px;">Tu cuenta ha sido creada exitosamente.</p>
            <p style="color: #666; font-size: 16px;">Gracias por confiar en Cementerio Parque Valle de Paz.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
            <p style="color: #666; font-size: 16px;">Por defecto, recibirás recordatorios de aniversarios de fallecimiento. Si prefieres no recibir estos recordatorios, puedes modificar esta preferencia en la configuración de tu cuenta.</p>
          
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
         <p style="color: #666; font-size: 16px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de bienvenida enviado a ${email}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${email}:`, error);
      throw new InternalServerErrorException(
        'Error al enviar el correo de bienvenida',
      );
    }
  }

  async sendDonationThankYouEmail(
    email: string,
    nombre: string,
    monto: number,
    fecha: Date,
  ) {
    try {
      const mailOptions = {
        from: `"Cementerio Valle de Paz" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '¡Gracias por tu donación!',
        html: `
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <img src="https://raw.githubusercontent.com/ProyectoFinalGroup1/front/develop/public/images/logo.jpg" alt="Logo Cementerio" style="max-width: 200px;">
            <h1 style="color: #333;">¡Gracias por tu donación, ${nombre}!</h1>
            <p style="color: #666; font-size: 16px;">Queremos expresar nuestro sincero agradecimiento por tu generosa donación de $${monto.toFixed(2)} realizada el ${fecha.toLocaleDateString()}.</p>
            <p style="color: #666; font-size: 16px;">Tu contribución nos ayuda a mantener y mejorar nuestros servicios para toda la comunidad.</p>
            <p style="color: #666; font-size: 16px;">¡Tu apoyo hace una gran diferencia!</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email de agradecimiento por donación enviado a ${email}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar email de agradecimiento a ${email}:`,
        error,
      );
      // No lanzamos excepción para no interrumpir el flujo principal si el correo falla
      return false;
    }
  }

  async sendDonationStatusUpdateEmail(
    email: string,
    nombre: string,
    monto: number,
    estado: string,
  ) {
    try {
      const mailOptions = {
        from: `"Cementerio Valle de Paz" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Actualización sobre tu donación',
        html: `
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <img src="https://raw.githubusercontent.com/ProyectoFinalGroup1/front/develop/public/images/logo.jpg" alt="Logo Cementerio" style="max-width: 200px;">
            <h1 style="color: #333;">Actualización de tu donación</h1>
            <p style="color: #666; font-size: 16px;">Hola ${nombre},</p>
            <p style="color: #666; font-size: 16px;">El estado de tu donación de $${monto.toFixed(2)} ha sido actualizado a: <strong>${estado}</strong>.</p>
            ${
              estado === 'aprobado'
                ? `<p style="color: #008000; font-size: 16px;">¡Tu donación ha sido recibida con éxito! Muchas gracias por tu generosidad.</p>`
                : `<p style="color: #666; font-size: 16px;">Si tienes alguna pregunta sobre el estado de tu donación, no dudes en contactarnos.</p>`
            }
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de actualización de donación enviado a ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar email de actualización a ${email}:`,
        error,
      );
      return false;
    }
  }
  // (añadir nuevos métodos)

  async sendAnniversaryReminderEmail(
    email: string,
    nombreUsuario: string,
    nombreInhumado: string,
    fechaFallecimiento: string,
    aniosTranscurridos: number,
    diasFaltantes: number,
  ) {
    try {
      const mailOptions = {
        from: `"Cementerio Valle de Paz" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Recordatorio: Aniversario de ${nombreInhumado}`,
        html: `
        <div style="text-align: center; font-family: Arial, sans-serif;">
          <img src="https://raw.githubusercontent.com/ProyectoFinalGroup1/front/develop/public/images/logo.jpg" alt="Logo Cementerio" style="max-width: 200px;">
          <h1 style="color: #333;">Recordatorio de Aniversario</h1>
          <p style="color: #666; font-size: 16px;">Estimado/a ${nombreUsuario},</p>
          <p style="color: #666; font-size: 16px;">Le recordamos que en ${diasFaltantes} ${diasFaltantes === 1 ? 'día' : 'días'} se cumplirá el ${aniosTranscurridos}º aniversario del fallecimiento de ${nombreInhumado}, fallecido el ${fechaFallecimiento}.</p>
          <p style="color: #666; font-size: 16px;">En Cementerio Parque Valle de Paz comprendemos la importancia de esta fecha para usted y su familia.</p>
          <p style="color: #666; font-size: 16px;">Si desea realizar algún servicio especial o necesita asistencia, por favor contáctenos.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
        </div>
      `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email de recordatorio de aniversario enviado a ${email}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar email de recordatorio de aniversario a ${email}:`,
        error,
      );
      return false;
    }
  }

  // Método  fechaPago
  async sendPaymentReminderEmail(
    email: string,
    nombreUsuario: string,
    fechaPago: Date | string,
    diasFaltantes: number,
  ) {
    try {
      // Asegurar que fechaPago sea un objeto Date
      const fechaPagoObj =
        fechaPago instanceof Date ? fechaPago : new Date(fechaPago);

      const mailOptions = {
        from: `"Cementerio Valle de Paz" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Recordatorio: Próximo pago de servicio`,
        html: `
          <div style="text-align: center; font-family: Arial, sans-serif;">
            <img src="https://raw.githubusercontent.com/ProyectoFinalGroup1/front/develop/public/images/logo.jpg" alt="Logo Cementerio" style="max-width: 200px;">
            <h1 style="color: #333;">Recordatorio de Pago</h1>
            <p style="color: #666; font-size: 16px;">Estimado/a ${nombreUsuario},</p>
            <p style="color: #666; font-size: 16px;">Le recordamos que en ${diasFaltantes} ${diasFaltantes === 1 ? 'día' : 'días'} vence su pago de servicios programado para el ${fechaPagoObj.toLocaleDateString()}.</p>
            <p style="color: #666; font-size: 16px;">Es importante realizar el pago a tiempo para mantener el servicio y/o evitar intereses por mora.</p>
            <p style="color: #666; font-size: 16px;">Si necesita más información o desea coordinar su pago, por favor contáctenos.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email de recordatorio de pago enviado a ${email}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar email de recordatorio de pago a ${email}:`,
        error,
      );
      return false;
    }
  }
}
