import { Controller, Get } from '@nestjs/common';
import { inhumadosService } from './inhumado.service';

@Controller('inhumados')
export class InhumadoController {
  constructor(private readonly inhumadosService: inhumadosService) {}

  @Get('seeder')
  async seed() {
    await this.inhumadosService.seed();
    return { message: 'sedder exitoso' }; //borrar
  }

  @Get()
  async allInhumados() {
    const datos = await this.inhumadosService.allInhumados();
    return datos;
  }
}
