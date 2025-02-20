import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inhumados')
export class Inhumado {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column()
  manzana: number;

  @Column()
  parcela: number;

  @Column()
  simbolo: number;

  @Column()
  ncliente: number;

  @Column({ nullable: true })
  imagenUrl: string;
}
