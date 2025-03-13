import { MensajesVirgenService } from './menVir.service';
import {
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
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Role } from '../Guards/Roles/roles.enum';
import { Roles } from '../Guards/Roles/roles.decorator';
// import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('mensajesVirgen')
export class MensajesVirgenController {
  constructor(private readonly mensajesVirgenService: MensajesVirgenService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener los mensajes a la virgen',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes obtenida exitosamente',
    type: [MensajeAVirgen],
  })
  async getMensajesVirgen() {
    return await this.mensajesVirgenService.getMensajesVirgen();
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard)
  @Get('filter')
  @ApiOperation({
    summary: 'Filtrar mensajes a la virgen (solo administradores)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de mensajes filtrada exitosamente',
    type: [MensajeAVirgen],
  })
  async filterMSsjs() {
    return await this.mensajesVirgenService.filterMSsjs();
  }

  @Post('addMensajeVirgen/:id')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Agregar un mensaje a la virgen ' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario que envía el mensaje',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        mensajeVirgen: {
          type: 'string',
          description: 'Contenido del mensaje a la virgen',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (opcional, JPG o PNG, máx 200MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Mensaje a la virgen creado exitosamente',
    type: MensajeAVirgen,
  })
  async addMensajeVirgen(
    @UploadedFile(
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
    @Param('id') id: string,
    @Body() mensajeVirgen: string,
  ) {
    let ImgCloudinary: string | undefined = undefined;
    if (file) {
      ImgCloudinary = await this.mensajesVirgenService.uploadImage(file);
    }

    const newMsjVirgen = await this.mensajesVirgenService.addMensajeVirgen(
      id,
      mensajeVirgen,
      ImgCloudinary,
    );
    return newMsjVirgen;
  }

  @Roles(Role.Admin)
  //@UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({
    summary: 'Aprobar un mensaje a la virgen (solo administradores)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del mensaje a aprobar',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje a la virgen aprobado exitosamente',
    type: MensajeAVirgen,
  })
  async aprobarMsj(@Param('id') id: string) {
    return this.mensajesVirgenService.aprobado(id);
  }

  @Roles(Role.Admin)
  //@UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una mensajes a la virgen por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del mensaje a eliminar',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje a la virgen eliminado exitosamente',
  })
  async deleteMensajeVirgen(@Param('id') id: string) {
    return await this.mensajesVirgenService.deleteMensajeVirgen(id);
  }

  @UseGuards(AuthGuard)
  @Put('editar/:id')
  @ApiOperation({ summary: 'Editar un mensaje a la virgen' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del mensaje a editar',
  })
  @ApiBody({
    type: MensajeAVirgen,
    description: 'Datos del mensaje a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje a la virgen actualizado exitosamente',
    type: MensajeAVirgen,
  })
  async updateMensajeVirgen(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    return await this.mensajesVirgenService.updateMensajeVirgen(
      id,
      mensajeVirgen,
    );
  }
}
