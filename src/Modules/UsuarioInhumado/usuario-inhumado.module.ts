import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioInhumado } from 'src/Entities/usuario-inhumado.entity';
import { UsuarioInhumadoController } from './usuario-inhumado.controller';
import { UsuarioInhumadoService } from './usuario-inhumado.service';
import { User } from 'src/Entities/user.entity';
import { Inhumado } from 'src/Entities/inhumados.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioInhumado, User, Inhumado])],
  controllers: [UsuarioInhumadoController],
  providers: [UsuarioInhumadoService],
  exports: [UsuarioInhumadoService],
})
export class UsuarioInhumadoModule {}
