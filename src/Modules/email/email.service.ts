// src/Modules/email/email.service.ts
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
    this.verifyConnection();
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
            <img src="logo_url" alt="Logo Cementerio" style="max-width: 200px;">
            <h1 style="color: #333;">¡Bienvenido ${nombre}!</h1>
            <p style="color: #666; font-size: 16px;">Tu cuenta ha sido creada exitosamente.</p>
            <p style="color: #666; font-size: 16px;">Gracias por confiar en Cementerio Parque Valle de Paz.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
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
}
