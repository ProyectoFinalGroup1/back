import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Cambiar las rutas relativas para que funcionen en producción
import { User } from '../../Entities/user.entity';
import { Donacion } from '../../Entities/donacion.entity';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';
import { EmailService } from '../email/email.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, User]), ConfigModule],
  controllers: [DonacionController],
  providers: [DonacionService, EmailService],
  exports: [DonacionService], // Exporta el servicio si otros módulos lo necesitan
})
export class DonacionModule {}
