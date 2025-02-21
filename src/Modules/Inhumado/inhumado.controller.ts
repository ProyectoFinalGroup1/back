
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, UseGuards  } from '@nestjs/common';
import { inhumadosService } from './inhumado.service';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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

  @Post("addInhumado")
  async addInhumado(@Body() inhumado: Inhumado){
      return await this.inhumadosService.addInhumado(inhumado)
  }

  @Get(':id') // cuiadado posicionamiento
  async getInhumadoById(@Param('id', ParseUUIDPipe) id: string) { 
    return await this.inhumadosService.getInhumadoById(id)
  }

  @Get('/:nombre/:apellido')
  async getInhumadoByNombreApellido(
      @Param('nombre') nombre: string,
      @Param('apellido') apellido: string,
    ): Promise<Inhumado> {
      return await this.inhumadosService.getInhumadoByNombreApellido(nombre, apellido);
  }

  @Put(':id')
  async updateInhumado(@Param('id', ParseUUIDPipe) id: string, @Body() inhumado: Partial<Inhumado>) {  
      return await this.inhumadosService.updateInhumado(id, inhumado)
  } 

  @Delete(':id') 
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string) { 
    return await this.inhumadosService.deleteInhumado(id)
    }
    
    
  
}
