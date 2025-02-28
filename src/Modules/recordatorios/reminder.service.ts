// src/Modules/reminder/reminder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Entities/user.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Inhumado)
    private inhumadoRepository: Repository<Inhumado>,
    private emailService: EmailService,
  ) {}

  // Ejecutar todos los días a las 9:00 AM para recordatorios de 7 días antes
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendWeeklyReminders() {
    this.logger.log('Iniciando envío de recordatorios semanales...');

    // Encontrar aniversarios de fallecimiento en 7 días
    await this.sendDeathAnniversaryReminders(7);

    await this.sendPaymentReminders(7);

    this.logger.log('Finalizado envío de recordatorios semanales');
  }

  // Ejecutar todos los días a las 10:00 AM para recordatorios de 1 día antes
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDailyReminders() {
    this.logger.log('Iniciando envío de recordatorios diarios...');

    // Encontrar aniversarios de fallecimiento mañana
    await this.sendDeathAnniversaryReminders(1);

    await this.sendPaymentReminders(1);

    this.logger.log('Finalizado envío de recordatorios diarios');
  }

  // Método para enviar recordatorios de aniversarios de fallecimiento
  private async sendDeathAnniversaryReminders(daysAhead: number) {
    try {
      // Obtener la fecha de hoy + días especificados
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);

      const targetMonth = targetDate.getMonth() + 1; // JavaScript meses son 0-11
      const targetDay = targetDate.getDate();

      // Buscar todos los inhumados
      const allInhumados = await this.inhumadoRepository.find();

      // Filtrar inhumados cuyo aniversario de fallecimiento sea en la fecha objetivo
      const inhumadosWithAnniversary = allInhumados.filter((inhumado) => {
        // Extraer día y mes de la fecha de fallecimiento (asumiendo formato: "DD de Mes de YYYY")
        const ffal = inhumado.ffal;
        const ffal_parts = ffal.split(' de ');

        if (ffal_parts.length >= 3) {
          const day = parseInt(ffal_parts[0], 10);
          let month = 0;

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

          month = months[monthName] || 0;

          return day === targetDay && month === targetMonth;
        }
        return false;
      });

      this.logger.log(
        `Encontrados ${inhumadosWithAnniversary.length} aniversarios para dentro de ${daysAhead} días`,
      );

      // Para cada inhumado con aniversario, enviar notificación a usuarios activos
      if (inhumadosWithAnniversary.length > 0) {
        const allUsers = await this.userRepository.find();
        // En el futuro, cuando se implemente la relación usuario-inhumado, se filtrará adecuadamente*******
        for (const inhumado of inhumadosWithAnniversary) {
          // Extraer el año de fallecimiento para calcular aniversario
          const ffal_parts = inhumado.ffal.split(' de ');
          const yearOfDeath = parseInt(ffal_parts[2], 10);
          const anniversaryYears = new Date().getFullYear() - yearOfDeath;

          // Filtrar solo usuarios que desean recibir recordatorios
          const usersWhoWantReminders = allUsers.filter(
            (user) => user.recibirRecordatoriosAniversarios !== false,
          );

          for (const user of usersWhoWantReminders) {
            await this.emailService.sendAnniversaryReminderEmail(
              user.email,
              user.nombre,
              inhumado.nombre + ' ' + inhumado.apellido,
              inhumado.ffal,
              anniversaryYears,
              daysAhead,
            );
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

  // Método para enviar recordatorios de fecha de pago
  // private async sendPaymentReminders(daysAhead: number) {
  //   try {
  //     // Calcular la fecha objetivo (hoy + días especificados)
  //     const targetDate = new Date();
  //     targetDate.setDate(targetDate.getDate() + daysAhead);

  //     // Formato para comparar solo año, mes y día
  //     const formattedTargetDate = targetDate.toISOString().split('T')[0];

  //     // Buscar usuarios con fecha de pago en la fecha objetivo
  //     const usersWithPaymentDue = await this.userRepository
  //       .createQueryBuilder('user')
  //       .where(`TO_CHAR(user.fechaPago, 'YYYY-MM-DD') = :formattedDate`, {
  //         formattedDate: formattedTargetDate,
  //       })
  //       .getMany();

  //     this.logger.log(
  //       `Encontrados ${usersWithPaymentDue.length} pagos pendientes para dentro de ${daysAhead} días`,
  //     );

  //     // Enviar recordatorio a cada usuario
  //     for (const user of usersWithPaymentDue) {
  //       // Asegurar que fechaPago sea un objeto Date
  //       const fechaPago =
  //         user.fechaPago instanceof Date
  //           ? user.fechaPago
  //           : new Date(user.fechaPago);

  //       await this.emailService.sendPaymentReminderEmail(
  //         user.email,
  //         user.nombre,
  //         fechaPago,
  //         daysAhead,
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `Error al enviar recordatorios de pago: ${error.message}`,
  //       error.stack,
  //     );
  //   }
  // }
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
          }
        }
      } else {
        // Ejecutar el código original si se encontraron usuarios
        for (const user of usersWithPaymentDue) {
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
