import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('mensajes_a_la_virgen')
export class MensajeAVirgen {
  @ApiProperty({
    description: 'ID único del mensaje',
    example: 'e4a1bc03-4094-4d8d-9c1f-a6c7dae24981',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Usuario que envió el mensaje',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.mensajesAVirgen)
  @JoinColumn({ name: 'usuario_id' })
  usuario: User;

  @ApiProperty({
    description: 'Contenido del mensaje',
    example: 'Gracias Virgen por escuchar mis plegarias.',
  })
  @Column({ type: 'text', nullable: false })
  texto: string;

  @ApiProperty({
    description: 'URL de la imagen adjunta al mensaje (opcional)',
    example:
      'https://res.cloudinary.com/example/image/upload/v1234567890/ejemplo.jpg',
    required: false,
  })
  @Column({ nullable: true })
  imagenUrl?: string;

  @ApiProperty({
    description: 'Fecha de publicación del mensaje',
    example: '2023-08-15T14:30:00Z',
  })
  @CreateDateColumn()
  fechaPublicacion: Date;

  @ApiProperty({
    description:
      'Estado de aprobación del mensaje (true: aprobado, false: pendiente)',
    example: false,
    default: false,
  })
  @Column({ default: false })
  estado: boolean;
}
