// src/Modules/reminder/reminder.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Recordatorios')
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Get('test-weekly')
  @ApiOperation({ summary: 'Probar envío de recordatorios semanales' })
  @ApiResponse({
    status: 200,
    description: 'Recordatorios enviados correctamente',
  })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async testWeeklyReminders() {
    await this.reminderService.sendWeeklyReminders();
    return { message: 'Recordatorios semanales enviados (test)' };
  }

  @Get('test-daily')
  @ApiOperation({ summary: 'Probar envío de recordatorios diarios' })
  @ApiResponse({
    status: 200,
    description: 'Recordatorios enviados correctamente',
  })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  async testDailyReminders() {
    await this.reminderService.sendDailyReminders();
    return { message: 'Recordatorios diarios enviados (test)' };
  }
}
