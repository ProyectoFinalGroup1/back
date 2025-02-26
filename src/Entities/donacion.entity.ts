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

  @Column({ nullable: true })
  mensajeAgradecimiento: string;

  @Column({ default: false })
  mostrarEnMuro: boolean;

  @Column({ nullable: true })
  nombreMostrar: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ nullable: true })
  metodoPago: string;

  @ManyToOne(() => User, (user) => user.donacion, { cascade: true })
  DonacionUser: User;
}
