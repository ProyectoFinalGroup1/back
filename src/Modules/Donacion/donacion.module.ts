import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { Donacion } from 'src/Entities/donacion.entity';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { EmailService } from '../email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, User]), ConfigModule],
  controllers: [DonacionController],
  providers: [DonacionService, EmailService],
})
export class DonacionModule {}
