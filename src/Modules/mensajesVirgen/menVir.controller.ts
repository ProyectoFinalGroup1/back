import { MensajesVirgenService } from './menVir.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Role } from '../Guards/Roles/roles.enum';
import { Roles } from '../Guards/Roles/roles.decorator';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { MensajeAVirgen } from 'src/Entities/mensajesVirgen.entity';

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
  @ApiOperation({ summary: 'Agregar un mensaje a la virgen' })
  async addMensajeVirgen(@Body() mensajeVirgen: Partial<MensajeAVirgen>) {
    return await this.mensajesVirgenService.addMensajeVirgen(mensajeVirgen);
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
}
