import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Inhumado } from "src/Entities/inhumados.entity";
import { Repository } from "typeorm";



@Injectable()
export class inhumadosRepository{
    constructor(
        @InjectRepository(Inhumado)
        private inhumadosRepository: Repository<Inhumado>
    ){}

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
}