import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { Donacion } from 'src/Entities/donacion.entity';
import { DonacionController } from './donacion.controller';
import { DonacionService } from './donacion.service';

@Module({
  imports: [TypeOrmModule.forFeature([Donacion, User])],
  controllers: [DonacionController],
  providers: [DonacionService],
})
export class DonacionModule {}
