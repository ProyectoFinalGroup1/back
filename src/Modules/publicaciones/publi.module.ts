import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Publicacion } from "src/Entities/publicaciones.entity";
import { PublicacionesController } from "./publi.controller";
import { PublicacionesService } from "./publi.service";
import { PublicacionesRepository } from "./publi.repository";
import { Inhumado } from "src/Entities/inhumados.entity";


@Module({
  imports: [TypeOrmModule.forFeature([Publicacion, Inhumado])],
  controllers: [PublicacionesController],
  providers: [PublicacionesService, PublicacionesRepository],
})
export class PublicacionesModule {}