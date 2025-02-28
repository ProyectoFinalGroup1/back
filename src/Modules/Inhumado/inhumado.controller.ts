import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { inhumadosService } from './inhumado.service';
import { Inhumado } from 'src/Entities/inhumados.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';

@ApiTags('Inhumados')
@ApiBearerAuth()
@Controller('inhumados')
export class InhumadoController {
  constructor(private readonly inhumadosService: inhumadosService) {}

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('seeder')
  @ApiOperation({ summary: 'Obtener seeder :D' })
  async seed() {
    await this.inhumadosService.seed();
    return { message: 'sedder exitoso' }; //borrar
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
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
  @Post('addInhumado')
  @ApiOperation({ summary: 'Agregar un inhumados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de inhumados obtenida exitosamente',
    type: [Inhumado],
  })
  async addInhumado(@Body() inhumado: Inhumado) {
    return await this.inhumadosService.addInhumado(inhumado);
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
  @UseGuards(AuthGuard)
  async getInhumadosByValle(
    @Param('valle') valle: string,
  ): Promise<Inhumado[]> {
    return await this.inhumadosService.getInhumadosByValle(valle);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
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
  @ApiOperation({ summary: 'Acutualizar un inhumado por id' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del inhumado (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Inhumado actualizado exitosamente',
    type: Inhumado,
  })
  async updateInhumado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() inhumado: Partial<Inhumado>,
  ) {
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
    description: 'Error al agregar el inhumado',
  })
  @ApiResponse({
    status: 404,
    description: 'Inhumado no encontrado',
  })
  async deleteInhumado(@Param('id', ParseUUIDPipe) id: string) {
    return await this.inhumadosService.deleteInhumado(id);
  }
}
