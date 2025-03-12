import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publicacion } from 'src/Entities/publicaciones.entity';
import { PublicacionesController } from './publi.controller';
import { PublicacionesService } from './publi.service';
import { PublicacionesRepository } from './publi.repository';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { User } from 'src/Entities/user.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Publicacion, Inhumado, User]),
    EmailModule,
  ],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, PublicacionesRepository],
})
export class PublicacionesModule {}
