import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('donacion')
export class Donacion {
  @ApiProperty({
    description: 'Identificador único de la donación',
    example: 'e1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @PrimaryGeneratedColumn('uuid')
  idDonacion: string;

  @ApiProperty({
    description: 'Monto de la donación',
    example: 100,
  })
  @Column()
  monto: number;

  @ApiProperty({
    description: 'Fecha de la donación',
    example: '2023-10-01T12:00:00Z',
  })
  @Column()
  Date: Date;

  @ApiProperty({
    description: 'Estado de la donación',
    example: false,
  })
  @Column({ default: false })
  Estado: boolean;

  @ApiProperty({
    description: 'Mensaje de agradecimiento (opcional)',
    example: 'Gracias por tu generosidad',
    required: false,
  })
  @Column({ nullable: true })
  mensajeAgradecimiento: string;

  @ApiProperty({
    description: 'Indica si se debe mostrar en el muro',
    example: true,
  })
  @Column({ default: false })
  mostrarEnMuro: boolean;

  @ApiProperty({
    description: 'Nombre a mostrar del donante (opcional)',
    example: 'Juan Pérez',
    required: false,
  })
  @Column({ nullable: true })
  nombreMostrar: string;

  @ApiProperty({
    description: 'ID de la transacción (opcional)',
    example: 'txn_123456789',
    required: false,
  })
  @Column({ nullable: true })
  transactionId: string;

  @ApiProperty({
    description: 'Método de pago utilizado (opcional)',
    example: 'tarjeta',
    required: false,
  })
  @Column({ nullable: true })
  metodoPago: string;

  @ManyToOne(() => User, (user) => user.donacion, { cascade: true })
  DonacionUser: User;
}
