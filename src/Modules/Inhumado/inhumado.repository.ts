import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Inhumado } from "src/Entities/inhumados.entity";
import { Repository } from "typeorm";
import { seedInhumados } from "./sedeer";



@Injectable()
export class inhumadosRepository{
    constructor(
        @InjectRepository(Inhumado)
        private inhumadosRepository: Repository<Inhumado>
    ){}

    async allInhumados(): Promise<Inhumado[]> {
        try {
          const allData = await this.inhumadosRepository.find();
          return allData;
        } catch (error) {
          console.error('Error al obtener los inhumados:', error);
          throw new Error('No se pudieron obtener los inhumados');
        }
      }

async addInhumado(inhumado: Inhumado){
    const newInhumado = await this.inhumadosRepository.save(inhumado)
    return newInhumado.id
    }

async getInhumadoById(id) { 
    return this.inhumadosRepository.findOne({where: {id}})
    } 

async getInhumadoByNombreApellido(nombre: string, apellido: string) {
    return await this.inhumadosRepository.findOne({ where: { nombre, apellido } });
    }

async getInhumadosByValle(valle: string): Promise<Inhumado[]> {
  return await this.inhumadosRepository.find({ where: { valle } });
}

async updateInhumado(id: string, inhumado: Partial<Inhumado>){
    await this.inhumadosRepository.update(id,inhumado);
    const updateInhumado = await this.inhumadosRepository.findOneBy({id})
    return updateInhumado
    }

async deleteInhumado(id: string) { 
    const inhumado = await this.inhumadosRepository.findOneBy({id});
      
    if (!inhumado){
        throw new NotFoundException("Inhumado no encontrado")
    }
    this.inhumadosRepository.remove(inhumado)
    return inhumado.id
        
    }

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
}