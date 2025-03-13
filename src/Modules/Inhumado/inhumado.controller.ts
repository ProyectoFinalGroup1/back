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
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { inhumadosService } from './inhumado.service';
import { Inhumado } from 'src/Entities/inhumados.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateInhumadoDto } from '../DTO/createInhumadoDto';
@ApiTags('Inhumados')
@ApiBearerAuth('Bearer')
@Controller('inhumados')
export class InhumadoController {
  constructor(private readonly inhumadosService: inhumadosService) {}

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('seeder')
  @ApiOperation({
    summary: 'Ejecutar seeder de inhumados (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Seeder ejecutado exitosamente',
  })
  async seed() {
    await this.inhumadosService.seed();
    return { message: 'sedder exitoso' }; //borrar
  }
  // Comenta temporalmente estos decoradores para pruebas
  // @Roles(Role.Admin)
  // @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Obtener lista de todos los inhumados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de inhumados obtenida exitosamente',
    type: [Inhumado],
  })
  async allInhumados() {
    const datos = await this.inhumadosService.allInhumados();
    return datos;
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Agregar un inhumados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de inhumados obtenida exitosamente',
    type: [Inhumado],
  })
  @Post('addInhumado')
  @UseInterceptors(FileInterceptor('file'))
  async addInhumado(
    @UploadedFile(
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
    inhumado: CreateInhumadoDto,
  ) {
    //=> FORMULARIOO PARA INGRESAR UN NUEVO INHUMAD
    try {
      const ImgCloudinary = await this.inhumadosService.uploadImage(file); //=> SUBE LA FOTO A CLOUDINARY Y DEVUELEV EL URL DE LA NUBE
      const newInhumado = await this.inhumadosService.addInhumado(
        inhumado, //=>CREAE AL USUARIO CON TODOS LOS DATOS INCLUYENDO LA URL
        ImgCloudinary,
      );
      return { message: 'Inhumado creado con exito: ', newInhumado };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('/:nombre/:apellido')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener un inhumado por nombre y apellido' })
  @ApiParam({ name: 'nombre', description: 'Nombre del inhumado' })
  @ApiParam({ name: 'apellido', description: 'Apellido del inhumado' })
  @ApiResponse({
    status: 200,
    description: 'Inhumado encontrado',
    type: Inhumado,
  })
  @ApiResponse({
    status: 404,
    description: 'Inhumado no encontrado',
  })
  async getInhumadoByNombreApellido(
    @Param('nombre') nombre: string,
    @Param('apellido') apellido: string,
  ): Promise<Inhumado> {
    return await this.inhumadosService.getInhumadoByNombreApellido(
      nombre,
      apellido,
    );
  }

  @Get('valle/:valle')
  @ApiOperation({ summary: 'Obtener inhumados por valle' })
  @ApiParam({
    name: 'valle',
    description: 'Valle donde se encuentran los inhumados',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de inhumados por valle obtenida exitosamente',
    type: [Inhumado],
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron inhumados en el valle especificado',
  })
  @UseGuards(AuthGuard)
  async getInhumadosByValle(
    @Param('valle') valle: string,
  ): Promise<Inhumado[]> {
    return await this.inhumadosService.getInhumadosByValle(valle);
  }

  // @Roles(Role.Admin)
  // @UseGuards(AuthGuard, RolesGuard)
  
  @Get(':id') // cuiadado posicionamiento
  @ApiOperation({ summary: 'Obtener un inhumado por id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del inhumado (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Inhumado encontrado',
    type: Inhumado,
  })
  @ApiResponse({
    status: 404,
    description: 'Inhumado no encontrado',
  })
  async getInhumadoById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.inhumadosService.getInhumadoById(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('imagen'))
  @ApiOperation({ summary: 'Actualizar un inhumado por id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del inhumado a actualizar (UUID)',
  })
  @ApiBody({
    type: Inhumado,
    description: 'Datos del inhumado a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Inhumado actualizado exitosamente',
    type: Inhumado,
  })
  @ApiResponse({
    status: 404,
    description: 'Inhumado no encontrado',
  })
  async updateInhumado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() inhumado: Partial<Inhumado>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl;
    if (file) {
      imageUrl = await this.inhumadosService.uploadImage(file);
      inhumado.imagenUrl = imageUrl;
    }
    return await this.inhumadosService.updateInhumado(id, inhumado);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Borrar un inhumado por id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del inhumado (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Inhumado eliminado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al eliminar el inhumado',
  })
  @ApiResponse({
    status: 404,
    description: 'Inhumado no encontrado',
  })
  async deleteInhumado(@Param('id', ParseUUIDPipe) id: string) {
    return await this.inhumadosService.deleteInhumado(id);
  }
}
