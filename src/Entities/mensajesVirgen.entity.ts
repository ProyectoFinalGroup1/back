import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('mensajes_a_la_virgen')
export class MensajeAVirgen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.mensajesAVirgen)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @Column({ type: 'text', nullable: false })
  texto: string;

  @Column({ nullable: true })
  imagenUrl?: string;

  @CreateDateColumn()
  fechaPublicacion: Date;

  @Column({ default: false })
  estado: boolean;
}
