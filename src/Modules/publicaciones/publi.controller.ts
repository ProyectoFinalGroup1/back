import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PublicacionesService } from './publi.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Role } from '../Guards/Roles/roles.enum';
import { Roles } from '../Guards/Roles/roles.decorator';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { CreatePublicacionDto } from '../DTO/publicacionDto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  //ADMINISTRADOR
  @Get('pendientes')
  async publicacionesPendientes() {
    return await this.publicacionesService.pendientes();
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('')
  async allPublicaciones() {
    return this.publicacionesService.allPublication();
  }

  @UseGuards(AuthGuard)
  @Post('addPublicacion')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Agregar un publicacion' })
  async addPublicacion(
    @UploadedFile(
      //=>Cloudinary parametros que requirer
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 200000000,
            message: 'El tamaño de la imagen debe ser inferior a 200MB',
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body()
    publicacionDto: CreatePublicacionDto,
  ) {
    try {
      const ImgCloudinary = await this.publicacionesService.uploadImage(file);
      const newPublicacion = await this.publicacionesService.addPublicacion(
        publicacionDto,
        ImgCloudinary,
      );
      return {
        message: 'Publicacion creada con exito a la espera de su aprobacion',
        newPublicacion,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
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
  @Patch('editar/:id')
  @ApiOperation({ summary: 'Editar una publicación' })
  async updatePublicacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() mensaje: string,
  ) {
    return await this.publicacionesService.updatePublicacion(id, mensaje);
  }
}
