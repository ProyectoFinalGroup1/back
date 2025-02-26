import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('donacion')
export class Donacion {
  @PrimaryGeneratedColumn('uuid')
  idDonacion: string;

  @Column()
  monto: number;

  @Column()
  Date: Date;

  @Column({ default: false })
  Estado: boolean;

  @ManyToOne(() => User, (user) => user.donacion, { cascade: true })
  DonacionUser: User;
}
