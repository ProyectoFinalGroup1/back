import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
// Cambiar las rutas de importación de entidades
import { Donacion } from '../../Entities/donacion.entity';
import { Repository } from 'typeorm';
import { User } from '../../Entities/user.entity';
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
    console.log(
      ' INICIANDO payMP - DTO recibido:',
      JSON.stringify(donacionDto),
    );

    try {
      const {
        email,
        monto,
        nombreMostrar,
        mensajeAgradecimiento,
        mostrarEnMuro,
      } = donacionDto;

      console.log(
        'VARIABLES EXTRAIDAS DEL DTO - email:',
        email,
        'monto:',
        monto,
      );
      this.logger.log(`Procesando donación: ${JSON.stringify(donacionDto)}`);

      // Verificar token
      console.log(
        'VERIFICANDO TOKEN DE  Mercado Pago:',
        process.env.MERCADOPAGO_ACCESS_TOKEN ? 'Existe' : 'No existe',
      );
      if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
        console.log('ERROR: TOKEN DE MERCADO PAGO NO CONFIGURADO');
        throw new BadRequestException('Token de Mercado Pago no configurado');
      }

      console.log(
        'ANTES DE BUSCAR USUARIO - REPOSITORIO EXISTE:',
        !!this.userRepository,
      );

      try {
        console.log('INTENTANDO ENCONTRAR USUARIO CON EMAIL:', email);
        console.log('TIPO DE userRepository:', typeof this.userRepository);
        console.log(
          ' METODOS DISPONIBLES EN  userRepository:',
          Object.getOwnPropertyNames(
            Object.getPrototypeOf(this.userRepository),
          ),
        );

        // Verificar si la entidad está registrada
        console.log('VERIFICANDO METADATOS DE USER ANTES DE findOne');
        if (this.userRepository.metadata) {
          console.log(
            'METADATA DE USER ENCONTRADA:',
            this.userRepository.metadata.name,
          );
        } else {
          console.log('NO SE ENCONTRO METADATA PARA USER');
        }

        const findUser = await this.userRepository.findOne({
          where: { email },
        });

        console.log(
          'RESULTADO DE LA BUSQUEDA DE USUARIO:',
          findUser ? 'USUARIO ENCONTRADO' : 'USUARIO NO ENCONTRADO',
        );

        if (findUser) {
          console.log('ID DE USUARIO ENCONTRADO:', findUser.idUser);
          console.log('NOMBRE DE USUARIO:', findUser.nombre);
          console.log('APELLIDO DE USUARIO:', findUser.apellido);
        }

        if (!findUser) {
          console.log('ERROR: NO SE ENCONTRO USUARIO CON EMAIL:', email);
          throw new NotFoundException('No se encontró al usuario');
        }

        // Usar Preference en lugar de Payment
        console.log('CONFIGURANDO OBJETO PREFERENCIA DE MERCADO PAGO');
        try {
          const mp = new Preference(
            new MercadoPagoConfig({
              accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
            }),
          );

          // Obtener URL base o usar una por defecto
          const appBaseUrl = process.env.APP_URL || 'http://localhost:3000';
          console.log('URL BASE PARA callbacks:', appBaseUrl);

          console.log('CREANDO OBJETO DE PREFERENCIA PARA API DE MERCADOPAGO');
          const preferenceData = {
            items: [
              {
                id: 'donacion-' + new Date().getTime(),
                title: 'Donación',
                description: 'Donación a la Capilla',
                quantity: 1,
                unit_price: monto,
                currency_id: 'ARS',
              },
            ],
            payer: {
              email: email,
              name: findUser.nombre || '',
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
          };

          console.log(
            'DATOS DE PREFERENCIAS PREPARADOS:',
            JSON.stringify(preferenceData),
          );
          console.log(
            'LLAMANDO A API DE MERCADO PAGO PARA CREAR PREFERENCIA...',
          );

          const preference = await mp.create({ body: preferenceData });
          console.log('PREFERENCIA CREADA EXITOSAMENTE. ID:', preference.id);
          this.logger.log(`Preferencia creada: ${JSON.stringify(preference)}`);

          // Guardar donación en estado pendiente
          console.log('CREANDO OBJETO DE DONACION PARA GUARDAR EN BD');
          const donacion = new Donacion();
          donacion.Date = new Date();
          donacion.Estado = false; // Inicialmente pendiente
          donacion.monto = monto;
          donacion.DonacionUser = findUser;
          donacion.nombreMostrar = nombreMostrar || findUser.nombre || '';
          donacion.mensajeAgradecimiento = mensajeAgradecimiento || '';
          donacion.mostrarEnMuro =
            mostrarEnMuro !== undefined ? mostrarEnMuro : true;
          donacion.transactionId = preference.id || '';
          donacion.metodoPago = ''; // Se actualizará cuando se complete el pago

          console.log('OBJETO DE DONACION CREADO:', JSON.stringify(donacion));
          console.log('GUARDANDO DONACION EN LA BASE DE DATOS...');

          const donacionGuardada = await this.donacionRepository.save(donacion);
          console.log(
            'DONACION GUARDADA EXITOSAMENTE. ID:',
            donacionGuardada.idDonacion,
          );
          this.logger.log(
            `Donación guardada: ${JSON.stringify(donacionGuardada)}`,
          );

          console.log('AQUI!!-PREPARANDO RESPUESTA DE EXITO');
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
              init_point: preference.init_point,
              sandbox_init_point: preference.sandbox_init_point,
            },
          };
        } catch (mercadoPagoError) {
          console.log(
            'Error en la integración con MercadoPago:',
            mercadoPagoError.message,
          );
          console.log('Stack de error de MercadoPago:', mercadoPagoError.stack);
          throw mercadoPagoError;
        }
      } catch (userError) {
        console.log('ERROR AL BUSCAR USUARIO:', userError.message);
        console.log('TIPO DE ERROR:', userError.constructor.name);
        console.log('STACK TRACE:', userError.stack);

        // Intentar determinar más información sobre el error
        if (userError.message.includes('EntityMetadataNotFound')) {
          console.log('CONFIRMADO: Es un error de EntityMetadataNotFound');
          console.log(
            'DETALLES DE LA ENTIDAD QUE CAUSA PROBLEMAS:',
            userError.message,
          );
        }

        throw userError;
      }
    } catch (generalError) {
      console.log('Error general en payMP:', generalError.message);
      console.log('Stack trace completo:', generalError.stack);

      this.logger.error(
        `Error al procesar el pago: ${generalError.message}`,
        generalError.stack,
      );

      if (generalError.response) {
        console.log(
          'Detalles adicionales del error (response):',
          JSON.stringify(generalError.response),
        );
        this.logger.error(
          `Detalles del error: ${JSON.stringify(generalError.response)}`,
        );
      }

      throw new BadRequestException(
        `Error al procesar el pago: ${generalError.message}`,
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
        const mp = new Payment(
          new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
          }),
        );

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
