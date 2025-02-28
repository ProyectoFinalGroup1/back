import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PublicacionesService } from './publi.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Role } from '../Guards/Roles/roles.enum';
import { Roles } from '../Guards/Roles/roles.decorator';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { CreatePublicacionDto } from '../DTO/publicacionDto';
import { Publicacion } from 'src/Entities/publicaciones.entity';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  //admin
  @Get('pendientes')
  async publicacionesPendientes() {
    return await this.publicacionesService.pendientes();
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard) // Solo admin
  @Get('')
  async allPublicaciones() {
    return this.publicacionesService.allPublication();
  }

  @UseGuards(AuthGuard)
  @Post('addPublicacion')
  @ApiOperation({ summary: 'Agregar un publicacion' })
  async addPublicacion(
    @Body() publicacionDto: CreatePublicacionDto,
  ): Promise<string> {
    return await this.publicacionesService.addPublicacion(publicacionDto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard) // Solo admin
  @Patch(':id')
  @ApiOperation({ summary: 'Aprobar una publicación' })
  async aprobarPublicacion(@Param('id') id: string) {
    return await this.publicacionesService.aprobarPublicacion(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una publicación por ID' })
  async deletePublicacion(@Param('id') id: string) {
    return await this.publicacionesService.deletePublicacion(id);
  }

  @UseGuards(AuthGuard)
  @Get(':nombreInhumado')
  @ApiOperation({ summary: 'Obtener publicaciones por nombre de inhumado' })
  async getPublicacionesByInhumado(@Param('nombreInhumado') nombre: string) {
    return await this.publicacionesService.getPublicacionesByInhumado(nombre);
  }

@UseGuards(AuthGuard)
@Put('editar/:id')
@ApiOperation({ summary: 'Editar una publicación' })
async updatePublicacion(@Param('id', ParseUUIDPipe) id: string , @Body() publicacionDto: Partial <CreatePublicacionDto>){
  return await this.publicacionesService.updatePublicacion(id, publicacionDto);
}
}
