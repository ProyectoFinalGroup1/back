import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { seedInhumados } from './sedeer';
import { Inhumado } from 'src/Entities/inhumados.entity';
import { inhumadosRepository } from './inhumado.repository';

@Injectable()
export class inhumadosService {
  constructor(
    @InjectRepository(Inhumado)
    private inhumadosRepository: Repository<Inhumado>,
    private readonly InhumadosRepository: inhumadosRepository
  ) {}

  async seed() {
    const existingDates = await this.inhumadosRepository.count();
    if (existingDates > 0) {
      return { message: 'La base de datos ya cuenta con registros' };
    }
    const precarga = seedInhumados.map((persona) => {
      const carga = new Inhumado();
      carga.nombre = persona.nombre;
      carga.apellido = persona.apellido;
      carga.fnac = persona.fnac;
      carga.ffal = persona.ffal;
      carga.valle = persona.valle;
      carga.sector = persona.sector;
      carga.manzana = persona.manzana;
      carga.parcela = persona.parcela;
      carga.simbolo = persona.simbolo;
      carga.ncliente = persona.ncliente;
      return carga;
    });
    await this.inhumadosRepository.save(precarga);
    return { message: 'Seeder ejecutado con exito' };
  }

  async allInhumados(): Promise<Inhumado[]> {
    try {
      const allData = await this.inhumadosRepository.find();
      return allData;
    } catch (error) {
      console.error('Error al obtener los inhumados:', error);
      throw new Error('No se pudieron obtener los inhumados');
    }
  }

  async addInhumado (inhumado: Inhumado){
    return this.InhumadosRepository.addInhumado(inhumado)
  }

  async getInhumadoById(id): Promise<Inhumado> { 
    const inhumado = await this.InhumadosRepository.getInhumadoById(id); 
    if (!inhumado) { 
      throw new NotFoundException('Inhumado no existente'); 
    } 
    return inhumado; 
  }   

  async getInhumadoByNombreApellido(nombre: string, apellido: string): Promise<Inhumado> {
    const inhumado = await this.InhumadosRepository.getInhumadoByNombreApellido(nombre, apellido);
    if (!inhumado) {
      throw new NotFoundException('Inhumado no existente');
    }
    return inhumado;
  }
  
  updateInhumado(id: string, inhumado: Partial<Inhumado>){ 
    return  this.InhumadosRepository.updateInhumado(id, inhumado); 
  }

  deleteInhumado(id: string): Promise<string> { 
    return  this.InhumadosRepository.deleteInhumado(id); 
  }
}
