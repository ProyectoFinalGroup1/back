// src/Modules/reminder/reminder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderService } from './reminder.service';
import { EmailModule } from '../email/email.module';
import { User } from 'src/Entities/user.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { ReminderController } from './reminder.controller';
import { UsuarioInhumadoModule } from '../UsuarioInhumado/usuario-inhumado.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Inhumado]),
    EmailModule,
    UsuarioInhumadoModule,
  ],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService],
})
export class ReminderModule {}
