import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Inhumado } from './inhumados.entity';

@Entity('usuario_inhumado')
export class UsuarioInhumado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.usuarioInhumados)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ManyToOne(() => Inhumado, (inhumado) => inhumado.usuarioInhumados)
  @JoinColumn({ name: 'inhumado_id' })
  inhumado: Inhumado;

  @CreateDateColumn()
  fechaAsociacion: Date;
}
