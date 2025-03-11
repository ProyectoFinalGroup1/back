import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MensajesVirgenController } from './menVir.controller';
import { MensajesVirgenService } from './menVir.service';
import { MensajesVirgenRepository } from './menVir.repository';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { User } from 'src/Entities/user.entity';
import { EmailModule } from '../email/email.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([MensajeAVirgen, User]),
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MensajesVirgenController],
  providers: [MensajesVirgenService, MensajesVirgenRepository],
})
export class MensajesVirgenModule {}
