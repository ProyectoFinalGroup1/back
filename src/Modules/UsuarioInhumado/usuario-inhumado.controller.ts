// src/Modules/UsuarioInhumado/usuario-inhumado.controller.ts
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsuarioInhumadoService } from './usuario-inhumado.service';
import { CrearUsuarioInhumadoDto } from './crear-usuario-inhumado.dto';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { RolesGuard } from '../Guards/Roles/Roles.guard';

@ApiTags('Relación Usuario-Inhumado')
@ApiBearerAuth()
@Controller('usuario-inhumado')
export class UsuarioInhumadoController {
  constructor(
    private readonly usuarioInhumadoService: UsuarioInhumadoService,
  ) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Crear asociación entre usuario e inhumado' })
  @ApiResponse({ status: 201, description: 'Asociación creada exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o asociación ya existe',
  })
  @ApiResponse({ status: 404, description: 'Usuario o inhumado no encontrado' })
  async crearAsociacion(@Body() dto: CrearUsuarioInhumadoDto) {
    return await this.usuarioInhumadoService.crearAsociacion(dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Eliminar asociación' })
  @ApiResponse({
    status: 200,
    description: 'Asociación eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Asociación no encontrada' })
  async eliminarAsociacion(@Param('id') id: string) {
    await this.usuarioInhumadoService.eliminarAsociacion(id);
    return { message: 'Asociación eliminada exitosamente' };
  }

  @Get('usuario/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener inhumados asociados a un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de inhumados obtenida exitosamente',
  })
  async obtenerInhumadosPorUsuario(@Param('id') usuarioId: string) {
    return await this.usuarioInhumadoService.obtenerInhumadosPorUsuario(
      usuarioId,
    );
  }

  @Get('inhumado/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener usuarios asociados a un inhumado' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  async obtenerUsuariosPorInhumado(@Param('id') inhumadoId: string) {
    return await this.usuarioInhumadoService.obtenerUsuariosPorInhumado(
      inhumadoId,
    );
  }
}
