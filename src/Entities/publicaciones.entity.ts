import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Inhumado } from './inhumados.entity';

@Entity('publicaciones')
export class Publicacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.publicaciones)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Inhumado, (inhumado) => inhumado.publicaciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inhumado_id' })
  inhumado: Inhumado;

  @Column({ type: 'text', nullable: false })
  mensaje: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imagen: string;

  @CreateDateColumn()
  fechaPublicacion: Date;

  @Column({ default: false, nullable: false })
  aprobada: boolean;
}
