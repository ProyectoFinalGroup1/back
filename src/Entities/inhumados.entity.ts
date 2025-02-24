import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Publicacion } from './publicaciones.entity';

@Entity('inhumados')
export class Inhumado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  apellido: string;

  @Column()
  nombre: string;

  @Column()
  fnac: string;

  @Column()
  ffal: string;

  @Column()
  valle: string;

  @Column()
  sector: string;

  @Column({ nullable: true })
  imagenUrl: string;

  @Column()
  manzana: number;

  @Column()
  parcela: number;

  @Column()
  simbolo: number;

  @Column()
  ncliente: number;

  @OneToMany(() => Publicacion, (publicacion) => publicacion.inhumado, { cascade: true })
  publicaciones: Publicacion[];
}
