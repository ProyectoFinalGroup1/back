import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Entities/user.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { EmailService } from '../email/email.service';
import { UsuarioInhumadoService } from '../UsuarioInhumado/usuario-inhumado.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Inhumado)
    private inhumadoRepository: Repository<Inhumado>,
    private emailService: EmailService,
    private usuarioInhumadoService: UsuarioInhumadoService,
  ) {}

  // Ejecutar todos los días a las 9:00 AM para recordatorios de 7 días antes
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendWeeklyReminders() {
    try {
      this.logger.log('Iniciando envío de recordatorios semanales...');

      // Encontrar aniversarios de fallecimiento en 7 días
      await this.sendDeathAnniversaryReminders(7);

      // Encontrar pagos en 7 días
      await this.sendPaymentReminders(7);

      this.logger.log('Finalizado envío de recordatorios semanales');
    } catch (err) {
      this.logger.error(
        `Error al enviar recordatorios semanales: ${err.message}`,
        err.stack,
      );
    }
  }

  // Ejecutar todos los días a las 10:00 AM para recordatorios de 1 día antes
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  // @Cron('*/5 * * * *') // Se ejecuta cada 5 minutos
  async sendDailyReminders() {
    try {
      this.logger.log('Iniciando envío de recordatorios diarios...');

      // Encontrar aniversarios de fallecimiento mañana
      await this.sendDeathAnniversaryReminders(1);

      // Encontrar pagos de mañana
      await this.sendPaymentReminders(1);

      this.logger.log('Finalizado envío de recordatorios diarios');
    } catch (err) {
      this.logger.error(
        `Error al enviar recordatorios diarios: ${err.message}`,
        err.stack,
      );
    }
  }

  // Método para enviar recordatorios de aniversarios de fallecimiento
  private async sendDeathAnniversaryReminders(daysAhead: number) {
    try {
      // Obtener la fecha de hoy + días especificados
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);

      const targetMonth = targetDate.getMonth() + 1; // JavaScript meses son 0-11
      const targetDay = targetDate.getDate();
      this.logger.log(
        `Buscando aniversarios para el día ${targetDay}/${targetMonth}`,
      );

      // Buscar todos los inhumados - SIN RELACIÓN
      const allInhumados = await this.inhumadoRepository.find();

      if (!allInhumados || allInhumados.length === 0) {
        this.logger.warn('No se encontraron inhumados en la base de datos');
        return;
      }

      // Filtrar inhumados cuyo aniversario sea en la fecha objetivo
      const inhumadosWithAnniversary = allInhumados.filter((inhumado) => {
        try {
          // Validar que exista ffal
          if (!inhumado.ffal) {
            this.logger.warn(
              `Inhumado ID ${inhumado.id} sin fecha de fallecimiento`,
            );
            return false;
          }

          // Extraer día y mes de la fecha de fallecimiento
          const ffal = inhumado.ffal;
          const ffal_parts = ffal.split(' de ');

          if (ffal_parts.length < 3) {
            this.logger.warn(
              `Formato de fecha inválido para inhumado ID ${inhumado.id}: ${ffal}`,
            );
            return false;
          }

          const day = parseInt(ffal_parts[0], 10);
          if (isNaN(day)) {
            this.logger.warn(
              `Día inválido para inhumado ID ${inhumado.id}: ${ffal_parts[0]}`,
            );
            return false;
          }

          // Convertir nombre del mes a número
          const monthName = ffal_parts[1].toLowerCase();
          const months = {
            enero: 1,
            febrero: 2,
            marzo: 3,
            abril: 4,
            mayo: 5,
            junio: 6,
            julio: 7,
            agosto: 8,
            septiembre: 9,
            octubre: 10,
            noviembre: 11,
            diciembre: 12,
          };

          const month = months[monthName] || 0;
          if (month === 0) {
            this.logger.warn(
              `Mes inválido para inhumado ID ${inhumado.id}: ${monthName}`,
            );
            return false;
          }

          return day === targetDay && month === targetMonth;
        } catch (error) {
          this.logger.error(
            `Error al procesar fecha para inhumado ID ${inhumado.id}:`,
            error,
          );
          return false;
        }
      });

      this.logger.log(
        `Encontrados ${inhumadosWithAnniversary.length} aniversarios para dentro de ${daysAhead} días`,
      );

      // Para cada inhumado con aniversario, enviar notificación a usuarios activos
      if (inhumadosWithAnniversary.length > 0) {
        for (const inhumado of inhumadosWithAnniversary) {
          // Obtener usuarios asociados a este inhumado
          const usuariosAsociados =
            await this.usuarioInhumadoService.obtenerUsuariosPorInhumado(
              inhumado.id,
            );

          // Extraer el año de fallecimiento para calcular aniversario
          const ffal_parts = inhumado.ffal.split(' de ');
          const yearOfDeath = parseInt(ffal_parts[2], 10);
          const anniversaryYears = new Date().getFullYear() - yearOfDeath;

          // Filtrar solo usuarios que desean recibir recordatorios
          const usersWhoWantReminders = usuariosAsociados.filter(
            (user) => user.recibirRecordatoriosAniversarios !== false,
          );

          for (const user of usersWhoWantReminders) {
            try {
              await this.emailService.sendAnniversaryReminderEmail(
                user.email,
                user.nombre,
                inhumado.nombre + ' ' + inhumado.apellido,
                inhumado.ffal,
                anniversaryYears,
                daysAhead,
              );
              this.logger.log(`Correo de aniversario enviado a ${user.email}`);
            } catch (error) {
              this.logger.error(
                `Error al enviar correo de aniversario a ${user.email}: ${error.message}`,
              );
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error al enviar recordatorios de aniversario: ${error.message}`,
        error.stack,
      );
    }
  }

  private async sendPaymentReminders(daysAhead: number) {
    try {
      // Calcular la fecha objetivo (hoy + días especificados)
      const today = new Date();
      this.logger.log(`Fecha actual: ${today.toISOString()}`);

      const targetDate = new Date();
      targetDate.setDate(today.getDate() + daysAhead);

      this.logger.log(`Fecha objetivo calculada: ${targetDate.toISOString()}`);

      // Formato para comparar solo año, mes y día
      const formattedTargetDate = targetDate.toISOString().split('T')[0];
      this.logger.log(
        `Formato de fecha para búsqueda SQL: ${formattedTargetDate}`,
      );

      // Obtener todos los usuarios con fecha de pago no nula (para verificar)
      const usersWithAnyPaymentDate = await this.userRepository
        .createQueryBuilder('user')
        .where('user.fechaPago IS NOT NULL')
        .getMany();

      this.logger.log(
        `Total de usuarios con alguna fecha de pago: ${usersWithAnyPaymentDate.length}`,
      );

      if (usersWithAnyPaymentDate.length > 0) {
        // Mostrar algunas fechas de pago para verificar el formato
        const sampleUsers = usersWithAnyPaymentDate.slice(0, 3);
        sampleUsers.forEach((user) => {
          this.logger.log(
            `Usuario ${user.email} tiene fecha de pago: ${user.fechaPago instanceof Date ? user.fechaPago.toISOString() : String(user.fechaPago)} (tipo: ${typeof user.fechaPago})`,
          );
        });
      }

      // Buscar usuarios con fecha de pago en la fecha objetivo
      const usersWithPaymentDue = await this.userRepository
        .createQueryBuilder('user')
        .where(`TO_CHAR(user.fechaPago, 'YYYY-MM-DD') = :formattedDate`, {
          formattedDate: formattedTargetDate,
        })
        .getMany();

      this.logger.log(
        `Encontrados ${usersWithPaymentDue.length} pagos pendientes para dentro de ${daysAhead} días`,
      );

      // Si la consulta normal no encuentra nada, intentar con una alternativa
      if (usersWithPaymentDue.length === 0) {
        this.logger.log('Probando consulta alternativa...');

        // Enfoque alternativo con EXTRACT para probar
        const alternativeUsers = await this.userRepository
          .createQueryBuilder('user')
          .where(`EXTRACT(YEAR FROM user.fechaPago) = :year`, {
            year: targetDate.getFullYear(),
          })
          .andWhere(`EXTRACT(MONTH FROM user.fechaPago) = :month`, {
            month: targetDate.getMonth() + 1,
          })
          .andWhere(`EXTRACT(DAY FROM user.fechaPago) = :day`, {
            day: targetDate.getDate(),
          })
          .getMany();

        this.logger.log(
          `Consulta alternativa encontró: ${alternativeUsers.length} usuarios`,
        );

        // Si la alternativa encuentra usuarios, usarlos
        if (alternativeUsers.length > 0) {
          this.logger.log('Usando resultados de la consulta alternativa');

          for (const user of alternativeUsers) {
            try {
              const fechaPago =
                user.fechaPago instanceof Date
                  ? user.fechaPago
                  : new Date(user.fechaPago);

              await this.emailService.sendPaymentReminderEmail(
                user.email,
                user.nombre,
                fechaPago,
                daysAhead,
              );
              this.logger.log(
                `Correo de recordatorio de pago enviado a ${user.email}`,
              );
            } catch (error) {
              this.logger.error(
                `Error al enviar recordatorio de pago a ${user.email}: ${error.message}`,
              );
            }
          }
        }
      } else {
        // Ejecutar el código original si se encontraron usuarios
        for (const user of usersWithPaymentDue) {
          try {
            const fechaPago =
              user.fechaPago instanceof Date
                ? user.fechaPago
                : new Date(user.fechaPago);

            await this.emailService.sendPaymentReminderEmail(
              user.email,
              user.nombre,
              fechaPago,
              daysAhead,
            );
            this.logger.log(
              `Correo de recordatorio de pago enviado a ${user.email}`,
            );
          } catch (error) {
            this.logger.error(
              `Error al enviar recordatorio de pago a ${user.email}: ${error.message}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error al enviar recordatorios de pago: ${error.message}`,
        error.stack,
      );
    }
  }
}
