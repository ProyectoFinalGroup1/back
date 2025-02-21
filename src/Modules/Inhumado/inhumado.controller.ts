import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { inhumadosService } from './inhumado.service';
import { Inhumado } from 'src/Entities/inhumados.entity';

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
