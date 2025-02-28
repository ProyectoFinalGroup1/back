// src/Modules/reminder/reminder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderService } from './reminder.service';
import { EmailModule } from '../email/email.module';
import { User } from 'src/Entities/user.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { ReminderController } from './remider.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Inhumado]), EmailModule],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
