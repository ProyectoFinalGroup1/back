import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { Publicacion } from './publicaciones.entity';
import { MensajeAVirgen } from './mensajesVirgen.entity';

@Entity('user')
export class User {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  idUser: string = uuid();

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    maxLength: 50,
  })
  @Column({ type: 'varchar', length: 50, nullable: false })
  apellido: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: 12345678,
    uniqueItems: true,
  })
  @Column({ type: 'int', unique: true })
  dni: number;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@email.com',
    maxLength: 50,
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '********',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100, nullable: false })
  password: string;

  @ApiProperty({
    description: 'Indica si el usuario es administrador',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isAdmin?: boolean;

  @ApiProperty({
    description: 'Publicaciones del usario'
  })
  @OneToMany(() => Publicacion, (publicacion) => publicacion.usuario, { cascade: true })
  publicaciones: Publicacion[];

  @OneToMany(() => MensajeAVirgen, (mensaje) => mensaje.usuario, { cascade: true })
  mensajesAVirgen: MensajeAVirgen[];
}
