import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajesVirgenController } from './menVir.controller';
import { MensajesVirgenService } from './menVir.service';
import { MensajesVirgenRepository } from './menVir.repository';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { User } from 'src/Entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MensajeAVirgen, User])],
  controllers: [MensajesVirgenController],
  providers: [MensajesVirgenService, MensajesVirgenRepository],
})
export class MensajesVirgenModule {}
