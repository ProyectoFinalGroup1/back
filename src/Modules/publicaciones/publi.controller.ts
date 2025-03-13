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
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: 'Obtener todas las publicaciones pendientes de aprobacion',
  })
  async publicacionesPendientes() {
    return await this.publicacionesService.pendientes();
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('')
  @ApiOperation({
    summary: 'Obtener todas las operaciones(solo Administradores)',
  })
  async allPublicaciones() {
    return this.publicacionesService.allPublication();
  }

  /*@UseGuards(AuthGuard)*/
  @Post('addPublicacion')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Agregar un publicacion' })
  async addPublicacion(
    @UploadedFile(
      //=>Cloudinary parametros que requirer
      new ParseFilePipe({
        fileIsRequired: false,
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
    file: Express.Multer.File | undefined,
    @Body()
    publicacionDto: CreatePublicacionDto,
  ) {
    let ImgCloudinary: string | undefined = undefined;
    if (file) {
      ImgCloudinary = await this.publicacionesService.uploadImage(file);
    }
    const newPublicacion = await this.publicacionesService.addPublicacion(
      publicacionDto,
      ImgCloudinary,
    );
    return {
      message: 'Publicacion creada con exito a la espera de su aprobacion',
      newPublicacion,
    };
  }

  /////////// FALTA AGREGAR LOS ROLES Y GUARDS
  @Get('misPublicaciones/:id')
  @ApiOperation({
    summary: 'Obtener publicaciones de un usuario especifico por ID',
  })
  @ApiParam({ name: 'id', description: 'ID del usuario', type: 'string' })
  async misPublicaciones(@Param('id') id: string) {
    return await this.publicacionesService.misPublicaciones(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard) // Solo admin
  @Patch(':id')
  @ApiOperation({ summary: 'Aprobar una publicación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicacion a aprobar',
    type: 'string',
  })
  async aprobarPublicacion(@Param('id') id: string) {
    return await this.publicacionesService.aprobarPublicacion(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una publicación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicacion a eliminar',
    type: 'string',
  })
  async deletePublicacion(@Param('id') id: string) {
    return await this.publicacionesService.deletePublicacion(id);
  }

  @UseGuards(AuthGuard)
  @Get(':nombreInhumado')
  @ApiOperation({ summary: 'Obtener publicaciones por nombre de inhumado' })
  @ApiParam({
    name: 'nombreInhumado',
    description: 'Nombre del inhumado a buscar',
    type: 'string',
  })
  async getPublicacionesByInhumado(@Param('nombreInhumado') nombre: string) {
    return await this.publicacionesService.getPublicacionesByInhumado(nombre);
  }

  @UseGuards(AuthGuard)
  @Patch('editar/:id')
  @ApiOperation({ summary: 'Editar una publicación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicación a editar',
    type: 'string',
  })
  @ApiBody({
    type: CreatePublicacionDto,
    required: false,
    description: 'Datos de la publicación a actualizar',
  })
  async updatePublicacion(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile(
      //=>Cloudinary parametros que requirer
      new ParseFilePipe({
        fileIsRequired: false,
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
    file: Express.Multer.File | undefined,
    @Body() newPublicacion: Partial<CreatePublicacionDto>,
  ) {
    if (
      !newPublicacion ||
      !newPublicacion.mensaje ||
      newPublicacion.mensaje.trim() === ''
    ) {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    let ImgCloudinary: string | null = null;
    if (file) {
      ImgCloudinary = await this.publicacionesService.uploadImage(file);
    }
    const editPublicacion = await this.publicacionesService.updatePublicacion(
      id,
      newPublicacion,
      ImgCloudinary,
    );
    return {
      message: 'Publicacion modificada a la espera de su aprobacion',
      editPublicacion,
    };
  }
}
