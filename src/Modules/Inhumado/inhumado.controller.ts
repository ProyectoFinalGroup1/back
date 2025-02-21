
import { Controller, Get, UseGuards } from '@nestjs/common';

import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { inhumadosService } from './inhumado.service';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';

@ApiTags('Inhumados')
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

  @Get()
  @ApiOperation({ summary: 'Obtener lista de todos los inhumados' })
  async allInhumados() {
    const datos = await this.inhumadosService.allInhumados();
    return datos;
  }
}
