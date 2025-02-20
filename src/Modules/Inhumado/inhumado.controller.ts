import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { inhumadosService } from './inhumado.service';

@ApiTags('Inhumados')
@Controller('inhumados')
export class InhumadoController {
  constructor(private readonly inhumadosService: inhumadosService) {}

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
