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
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Role } from '../Guards/Roles/roles.enum';
import { Roles } from '../Guards/Roles/roles.decorator';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('mensajesVirgen')
export class MensajesVirgenController {
  constructor(private readonly mensajesVirgenService: MensajesVirgenService) {}

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Obtener los mensajes a la virgen por id del usuario',
  })
  async getMensajesVirgen() {
    return await this.mensajesVirgenService.getMensajesVirgen();
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard)
  @Get('filter')
  async filterMSsjs() {
    return await this.mensajesVirgenService.filterMSsjs();
  }

  @UseGuards(AuthGuard)
  @Post('addMensajeVirgen')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Agregar un mensaje a la virgen' })
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
    @Body() mensajeVirgen: Partial<MensajeAVirgen>,
  ) {
    let ImgCloudinary: string | undefined = undefined;
    if (file) {
      ImgCloudinary = await this.mensajesVirgenService.uploadImage(file);
    }

    const newMsjVirgen = await this.mensajesVirgenService.addMensajeVirgen(
      mensajeVirgen,
      ImgCloudinary,
    );
    return {
      message: 'Publicacion creada con exito a la espera de su aprobacion',
      newMsjVirgen,
    };
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard)
  @Patch(':id')
  async aprobarMsj(@Param('id') id: string) {
    return this.mensajesVirgenService.aprobado(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una mensajes a la virgen por ID' })
  async deleteMensajeVirgen(@Param('id') id: string) {
    return await this.mensajesVirgenService.deleteMensajeVirgen(id);
  }

  @UseGuards(AuthGuard)
  @Put('editar/:id')
  @ApiOperation({ summary: 'Editar un mensaje a la virgen' })
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
