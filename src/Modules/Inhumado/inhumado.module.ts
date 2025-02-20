import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { InhumadoController } from './inhumado.controller';
import { inhumadosService } from './inhumado.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inhumado])],
  controllers: [InhumadoController],
  providers: [inhumadosService],
})
export class InhumadosModule {}
