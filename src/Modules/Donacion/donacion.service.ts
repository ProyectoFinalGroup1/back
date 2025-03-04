import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { Donacion } from 'src/Entities/donacion.entity';
import { Repository } from 'typeorm';
import { User } from 'src/Entities/user.entity';
import { EmailService } from '../email/email.service';
import { DonacionDto } from './donacionDTO';

@Injectable()
export class DonacionService {
  private readonly logger = new Logger(DonacionService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Donacion)
    private donacionRepository: Repository<Donacion>,
    private emailService: EmailService,
  ) {}

  async allDonations() {
    const donaciones = await this.donacionRepository.find({
      where: { Estado: true },
      relations: ['DonacionUser'],
    });
    if (donaciones.length === 0)
      throw new BadRequestException('No hay donaciones aprobadas');
    return donaciones;
  }

  async getDonacionesMuro() {
    return this.donacionRepository.find({
      where: { mostrarEnMuro: true, Estado: true },
      select: ['nombreMostrar', 'monto', 'mensajeAgradecimiento', 'Date'],
      order: { Date: 'DESC' },
    });
  }

  async getDonacionesAprobadasByUserId(userId: string): Promise<Donacion[]> {
    const donaciones = await this.donacionRepository.find({
      where: {
        DonacionUser: { idUser: userId },
        Estado: true,
      },
      relations: ['DonacionUser'],
      order: { Date: 'DESC' },
    });
    if (donaciones.length === 0) {
      throw new NotFoundException(
        'No se encontraron donaciones aprobadas para este usuario',
      );
    }
    return donaciones;
  }

  async getDonacionesByUserId(userId: string): Promise<Donacion[]> {
    const donaciones = await this.donacionRepository.find({
      where: { DonacionUser: { idUser: userId } },
      relations: ['DonacionUser'],
      order: { Date: 'DESC' },
    });
    if (donaciones.length === 0) {
      throw new NotFoundException(
        'No se encontraron donaciones para este usuario',
      );
    }
    return donaciones;
  }

  async payMP(donacionDto: DonacionDto) {
    const {
      email,
      monto,
      nombreMostrar,
      mensajeAgradecimiento,
      mostrarEnMuro,
    } = donacionDto;

    this.logger.log(`Procesando donación: ${JSON.stringify(donacionDto)}`);

    // Verificar token
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      throw new BadRequestException('Token de Mercado Pago no configurado');
    }

    const findUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!findUser) {
      throw new NotFoundException('No se encontró al usuario');
    }

    try {
      const client = new MercadoPagoConfig({
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      });

      const mp = new Preference(client);

      // Asegurarnos de tener una URL base válida
      const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';

      // Asegurarnos de que el monto sea un número válido
      const montoNumerico = Number(monto);
      if (isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new BadRequestException(
          'El monto debe ser un número válido mayor a cero',
        );
      }

      const preferenceData = {
        items: [
          {
            id: 'donacion-' + new Date().getTime(),
            title: 'Donación a la Capilla',
            description: 'Donación a la Capilla',
            quantity: 1,
            unit_price: montoNumerico,
            currency_id: 'ARS', // Ajusta según tu país (ARS para Argentina)
          },
        ],
        payer: {
          email: email,
          name: findUser.nombre || 'Donante',
          surname: findUser.apellido || '',
        },
        back_urls: {
          success: `${appBaseUrl}/donacion/success`,
          failure: `${appBaseUrl}/donacion/failure`,
          pending: `${appBaseUrl}/donacion/pending`,
        },
        auto_return: 'approved',
        statement_descriptor: 'Donación Capilla',
        external_reference: findUser.idUser.toString(),
        notification_url: `${appBaseUrl}/mercadopago/webhook`,
        // Configuración adicional para mejorar tasa de aprobación
        binary_mode: false, // Permite pagos pendientes
      };

      // Registrar la solicitud enviada a Mercado Pago para depuración
      this.logger.log(
        `Enviando solicitud a Mercado Pago: ${JSON.stringify(preferenceData)}`,
      );

      const preference = await mp.create({ body: preferenceData });
      this.logger.log(`Preferencia creada: ${JSON.stringify(preference)}`);

      // Guardar donación en estado pendiente
      const donacion = new Donacion();
      donacion.Date = new Date();
      donacion.Estado = false; // Inicialmente pendiente
      donacion.monto = montoNumerico;
      donacion.DonacionUser = findUser;
      donacion.nombreMostrar = nombreMostrar || findUser.nombre || 'Anónimo';
      donacion.mensajeAgradecimiento = mensajeAgradecimiento || '';
      donacion.mostrarEnMuro =
        mostrarEnMuro !== undefined ? mostrarEnMuro : true;
      donacion.transactionId = preference.id || '';
      donacion.metodoPago = ''; // Se actualizará cuando se complete el pago

      const donacionGuardada = await this.donacionRepository.save(donacion);
      this.logger.log(`Donación guardada: ${JSON.stringify(donacionGuardada)}`);

      return {
        success: true,
        mensaje: 'Enlace de pago generado correctamente',
        donacion: {
          id: donacionGuardada.idDonacion,
          monto: donacionGuardada.monto,
          estado: 'pendiente',
          fecha: donacionGuardada.Date,
        },
        pagoInfo: {
          preferenceId: preference.id,
          init_point: preference.init_point, // URL para redirigir al usuario al checkout
          sandbox_init_point: preference.sandbox_init_point, // Para ambiente de pruebas
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al procesar el pago: ${error.message}`,
        error.stack,
      );
      // Mostrar más detalles del error para depuración
      if (error.response) {
        this.logger.error(
          `Detalles del error: ${JSON.stringify(error.response.data || error.response)}`,
        );
      }
      throw new BadRequestException(
        `Error al procesar el pago: ${error.message}`,
      );
    }
  }

  // Webhook para recibir notificaciones de Mercado Pago
  async handleWebhook(data: any) {
    this.logger.log(`Webhook recibido: ${JSON.stringify(data)}`);

    try {
      // Verificar si es una notificación de pago
      if (data.type === 'payment') {
        const paymentId = data.data.id;

        // Consultar el estado del pago
        const mpConfig = new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        });

        const mp = new Payment(mpConfig);

        const paymentInfo = await mp.get({ id: paymentId });
        this.logger.log(`Información del pago: ${JSON.stringify(paymentInfo)}`);

        // En pagos con preference, necesitamos buscar por external_reference
        const externalReference = paymentInfo.external_reference;

        // Obtener los datos adicionales del pago como objeto para acceder a campos no tipados
        const paymentData = paymentInfo as any;

        // Buscar la donación relacionada (primero por transactionId)
        let donacion = await this.donacionRepository.findOne({
          where: { transactionId: paymentId.toString() },
          relations: ['DonacionUser'],
        });

        // Si no encontramos por paymentId, intentamos buscar por preference_id si está disponible
        if (!donacion && paymentData.preference_id) {
          donacion = await this.donacionRepository.findOne({
            where: { transactionId: paymentData.preference_id },
            relations: ['DonacionUser'],
          });
        }

        // Si aún no lo encontramos, buscar por el ID del usuario en external_reference
        if (!donacion && externalReference) {
          const user = await this.userRepository.findOne({
            where: { idUser: externalReference },
          });

          if (user) {
            // Buscar la donación más reciente de este usuario que esté pendiente
            donacion = await this.donacionRepository.findOne({
              where: { DonacionUser: { idUser: user.idUser }, Estado: false },
              relations: ['DonacionUser'],
              order: { Date: 'DESC' },
            });
          }
        }

        if (donacion) {
          // Actualizar datos de la donación
          const estadoAnterior = donacion.Estado;
          const nuevoEstado = paymentInfo.status === 'approved';

          // Actualizar método de pago y estado
          donacion.metodoPago = paymentInfo.payment_method_id || '';

          // Actualizamos el transactionId para que apunte al pago real
          if (donacion.transactionId !== paymentId.toString()) {
            this.logger.log(
              `Actualizando transactionId de ${donacion.transactionId} a ${paymentId}`,
            );
            // Guardamos el preference_id en algún otro lugar si es necesario
            donacion.transactionId = paymentId.toString();
          }

          // Solo actualizar si hay cambio de estado
          if (estadoAnterior !== nuevoEstado) {
            donacion.Estado = nuevoEstado;
            await this.donacionRepository.save(donacion);
            this.logger.log(
              `Estado de donación actualizado: ${donacion.idDonacion} - ${nuevoEstado}`,
            );

            // Si el pago pasó de pendiente a aprobado, enviar correo
            if (!estadoAnterior && nuevoEstado) {
              await this.emailService.sendDonationThankYouEmail(
                donacion.DonacionUser.email,
                donacion.nombreMostrar ||
                  donacion.DonacionUser.nombre ||
                  'Donante',
                donacion.monto,
                donacion.Date,
              );
            } else {
              // Enviar correo de actualización de estado
              await this.emailService.sendDonationStatusUpdateEmail(
                donacion.DonacionUser.email,
                donacion.nombreMostrar ||
                  donacion.DonacionUser.nombre ||
                  'Donante',
                donacion.monto,
                nuevoEstado ? 'aprobado' : 'rechazado',
              );
            }
          }
        } else {
          this.logger.warn(
            `No se encontró donación relacionada con el pago ${paymentId} (user: ${externalReference})`,
          );
        }

        return {
          success: true,
          message: 'Notificación procesada correctamente',
        };
      }

      return { success: true, message: 'Notificación recibida' };
    } catch (error) {
      this.logger.error(
        `Error al procesar la notificación: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Error al procesar la notificación: ${error.message}`,
      );
    }
  }
}
