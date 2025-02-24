import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { PublicacionesService } from "./publi.service";
import { ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { Publicacion } from "src/Entities/publicaciones.entity";



@Controller("publicaciones")
export class PublicacionesController {
    constructor (private readonly publicacionesService: PublicacionesService){}


@Get(':nombreInhumado')
@ApiOperation({ summary: 'Obtener publicaciones por nombre de inhumado' })
async getPublicacionesByInhumado(@Param('nombreInhumado') nombre: string) {
    return await this.publicacionesService.getPublicacionesByInhumado(nombre);
}


@UseGuards(AuthGuard)
@Post("addPublicacion")
@ApiOperation({ summary: 'Agregar un publicacion' })
async addInhumado(@Body() publicacion: Publicacion){
    return await this.publicacionesService.addPublicacion(publicacion)
  }

@Delete(':id')
@ApiOperation({ summary: 'Eliminar una publicación por ID' })
async deletePublicacion(@Param('id') id: string) {
return await this.publicacionesService.deletePublicacion(id);
  }
}