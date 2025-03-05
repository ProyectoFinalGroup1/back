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
          // Usar BACKEND_URL para las notificaciones de webhook
          const backendUrl = process.env.BACKEND_URL || appBaseUrl;

          console.log('URL BASE PARA callbacks frontend:', appBaseUrl);
          console.log('URL BASE PARA webhook backend:', backendUrl);

          console.log('CREANDO OBJETO DE PREFERENCIA PARA API DE MERCADOPAGO');

          // Aseguramos que el DNI sea una cadena de texto
          const dniAsString = findUser.dni ? String(findUser.dni) : '';

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
              identification: {
                type: 'DNI',
                number: dniAsString, // Ahora es garantizado string
              },
            },
            back_urls: {
              success: `${appBaseUrl}/donacion/success`,
              failure: `${appBaseUrl}/donacion/failure`,
              pending: `${appBaseUrl}/donacion/pending`,
            },
            auto_return: 'approved',
            statement_descriptor: 'Donación Capilla',
            external_reference: findUser.idUser.toString(),
            notification_url: `${backendUrl}/mercadopago/webhook`,
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

          // Información detallada de error para debugging
          if (mercadoPagoError.response && mercadoPagoError.response.data) {
            console.log(
              'Respuesta de error MercadoPago:',
              JSON.stringify(mercadoPagoError.response.data),
            );
          }

          // Manejo específico según el tipo de error
          if (
            mercadoPagoError.message &&
            mercadoPagoError.message.includes('token')
          ) {
            throw new BadRequestException(
              'Error de autenticación con Mercado Pago. Verifique el token de acceso.',
            );
          } else if (
            mercadoPagoError.message &&
            mercadoPagoError.message.includes('request')
          ) {
            throw new BadRequestException(
              'Error en la solicitud a Mercado Pago. Verifique los datos enviados.',
            );
          } else {
            throw new BadRequestException(
              `Error en Mercado Pago: ${mercadoPagoError.message}`,
            );
          }
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
          throw new BadRequestException(
            'Error con la entidad de usuario. Contacte al administrador.',
          );
        } else if (userError instanceof NotFoundException) {
          throw userError; // Reenviar errores de usuario no encontrado
        } else {
          throw new BadRequestException(
            `Error al buscar usuario: ${userError.message}`,
          );
        }
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

      // Mejorar los mensajes de error para el usuario final
      if (generalError instanceof NotFoundException) {
        throw new NotFoundException(
          generalError.message || 'No se encontró el usuario especificado',
        );
      } else if (generalError instanceof BadRequestException) {
        throw generalError; // Ya es un BadRequestException, lo pasamos tal cual
      } else {
        throw new BadRequestException(
          `Error al procesar el pago: ${generalError.message || 'Error desconocido'}`,
        );
      }
    }
  }
  async handleWebhook(data: any) {
    this.logger.log(`Webhook recibido: ${JSON.stringify(data)}`);
    console.log('WEBHOOK RECIBIDO:', JSON.stringify(data));
    try {
      // Verificar el tipo de notificación
      if (!data || (!data.type && !data.action)) {
        this.logger.warn('Webhook sin tipo de notificación válido');
        console.log('WEBHOOK SIN TIPO DE NOTIFICACION VALIDO');
        return {
          success: true,
          message: 'Notificación recibida pero sin tipo válido',
        };
      }

      // Mercado Pago puede enviar diferentes formatos de webhook
      // 1. Notificación IPN: { type: 'payment', data: { id: '123456789' } }
      // 2. Notificación Webhook: { action: 'payment.created', data: { id: '123456789' } }

      let paymentId: string | null = null;

      if (data.type === 'payment' && data.data && data.data.id) {
        paymentId = data.data.id.toString();
        console.log('ID DE PAGO RECIBIDO:', paymentId);
      } else if (
        data.action &&
        data.action.startsWith('payment.') &&
        data.data &&
        data.data.id
      ) {
        paymentId = data.data.id.toString();
      }

      if (!paymentId) {
        this.logger.warn('Webhook sin ID de pago válido');
        console.log('WEBHOOK SIN ID DE PAGO VALIDO');
        return { success: true, message: 'Notificación sin ID de pago válido' };
      }

      this.logger.log(`Procesando pago ID: ${paymentId}`);
      console.log('PROCESANDO PAGO ID:', paymentId);

      // Consultar el estado del pago
      const mp = new Payment(
        new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        }),
      );

      const paymentInfo = await mp.get({ id: paymentId });
      this.logger.log(`Información del pago: ${JSON.stringify(paymentInfo)}`);
      console.log('INFORMACION DEL PAGO:', JSON.stringify(paymentInfo));

      // Información adicional que podemos necesitar
      const paymentData = paymentInfo as any;
      const preferenceId = paymentData.preference_id || null;
      const externalReference = paymentInfo.external_reference || null;
      const status = paymentInfo.status || null;

      this.logger.log(
        `Detalles: preferenceId=${preferenceId}, externalRef=${externalReference}, status=${status}`,
      );
      console.log(
        'DETALLES ADICIONALES:',
        `preferenceId=${preferenceId}, externalRef=${externalReference}, status=${status}`,
      );

      // Estrategia para buscar la donación:
      // 1. Primero intentamos por transactionId = paymentId
      // 2. Si no funciona, buscamos por transactionId = preferenceId
      // 3. Si aún no funciona, buscamos por el ID del usuario (external_reference)

      let donacion: Donacion | null = null;

      // Buscar la donación por paymentId
      if (paymentId) {
        donacion = await this.donacionRepository.findOne({
          where: { transactionId: paymentId },
          relations: ['DonacionUser'],
        });

        if (donacion) {
          this.logger.log(
            `Donación encontrada por paymentId: ${donacion.idDonacion}`,
          );
        }
      }

      // Si no se encontró por paymentId, buscar por preferenceId
      if (!donacion && preferenceId) {
        donacion = await this.donacionRepository.findOne({
          where: { transactionId: preferenceId },
          relations: ['DonacionUser'],
        });

        if (donacion) {
          this.logger.log(
            `Donación encontrada por preferenceId: ${donacion.idDonacion}`,
          );
        }
      }

      // Si aún no se encontró, buscar por external_reference (userId)
      if (!donacion && externalReference) {
        try {
          const user = await this.userRepository.findOne({
            where: { idUser: externalReference },
          });

          if (user) {
            // Buscar donaciones pendientes de este usuario
            const donacionesPendientes = await this.donacionRepository.find({
              where: { DonacionUser: { idUser: user.idUser }, Estado: false },
              relations: ['DonacionUser'],
              order: { Date: 'DESC' },
            });

            if (donacionesPendientes.length > 0) {
              // Tomamos la más reciente
              donacion = donacionesPendientes[0];
              this.logger.log(
                `Donación encontrada por userId: ${donacion.idDonacion}`,
              );
            }
          }
        } catch (error) {
          this.logger.error(`Error al buscar por userId: ${error.message}`);
        }
      }

      if (donacion) {
        // Actualizar datos de la donación
        const estadoAnterior = donacion.Estado;
        // Mercado Pago considera aprobado solo con status = 'approved'
        const nuevoEstado = status === 'approved';

        // Actualizamos método de pago
        donacion.metodoPago =
          paymentInfo.payment_method_id ||
          paymentInfo.payment_type_id ||
          'desconocido';

        // Si encontramos por preferenceId, actualizar el transactionId al paymentId
        if (donacion.transactionId !== paymentId) {
          this.logger.log(
            `Actualizando transactionId: ${donacion.transactionId} → ${paymentId}`,
          );
          donacion.transactionId = paymentId;
        }

        // Solo actualizar el estado si hay un cambio
        if (estadoAnterior !== nuevoEstado) {
          donacion.Estado = nuevoEstado;

          try {
            await this.donacionRepository.save(donacion);
            this.logger.log(
              `Estado de donación actualizado: ${donacion.idDonacion} - ${nuevoEstado ? 'Aprobado' : 'No aprobado'}`,
            );

            // Enviar email según corresponda
            if (donacion.DonacionUser && donacion.DonacionUser.email) {
              if (!estadoAnterior && nuevoEstado) {
                await this.emailService.sendDonationThankYouEmail(
                  donacion.DonacionUser.email,
                  donacion.nombreMostrar ||
                    donacion.DonacionUser.nombre ||
                    'Donante',
                  donacion.monto,
                  donacion.Date,
                );
                this.logger.log(
                  `Email de agradecimiento enviado a ${donacion.DonacionUser.email}`,
                );
              } else {
                await this.emailService.sendDonationStatusUpdateEmail(
                  donacion.DonacionUser.email,
                  donacion.nombreMostrar ||
                    donacion.DonacionUser.nombre ||
                    'Donante',
                  donacion.monto,
                  nuevoEstado ? 'aprobado' : 'rechazado',
                );
                this.logger.log(
                  `Email de actualización enviado a ${donacion.DonacionUser.email}`,
                );
              }
            }
          } catch (error) {
            this.logger.error(`Error al guardar donación: ${error.message}`);
            throw error;
          }
        } else {
          this.logger.log(
            `No hay cambio de estado para la donación ${donacion.idDonacion}`,
          );
        }
      } else {
        this.logger.warn(
          `No se encontró donación relacionada con el pago ${paymentId} (preferenceId: ${preferenceId}, user: ${externalReference})`,
        );
      }

      return {
        success: true,
        message: 'Notificación procesada correctamente',
      };
    } catch (error) {
      this.logger.error(
        `Error al procesar la notificación: ${error.message}`,
        error.stack,
      );
      // No lanzamos una excepción para evitar que Mercado Pago reintente enviar la notificación
      // En su lugar, devolvemos un 200 con un mensaje de error
      return {
        success: false,
        message: `Error al procesar la notificación: ${error.message}`,
      };
    }
  }
}
