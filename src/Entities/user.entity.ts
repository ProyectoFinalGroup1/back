import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { ApiProperty } from '@nestjs/swagger';
import { Publicacion } from './publicaciones.entity';
import { MensajeAVirgen } from './mensajesVirgen.entity';
import { Donacion } from './donacion.entity';
import { UsuarioInhumado } from './usuario-inhumado.entity';

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
    description: 'Nro de telefono del usuario',
    example: 12345678,
    uniqueItems: true,
  })
  @Column({ type: 'int', nullable: true })
  phoneNumber: number;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@email.com',
    maxLength: 50,
    uniqueItems: true,
  })
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @ApiProperty({
    description: 'URL de la imagen del inhumado',
    example: 'https://example.com/image.jpg',
  })
  @Column({ nullable: true })
  imagenUrl: string;

  //SE AGREGA OPCION DE RECIBIR FECHA DE PAGO
  @ApiProperty({
    description: 'Fecha de próximo pago',
    example: '2025-03-15',
    required: false,
  })
  @Column({ type: 'date', nullable: true })
  fechaPago: Date;

  //SE AGREGA OPCION DE RECIBIR RECORDATORIOS DE FECHAS ESPECIALES
  @ApiProperty({
    description: 'Preferencia para recibir recordatorios de aniversarios',
    example: true,
    default: true,
  })
  @Column({ type: 'boolean', default: true })
  recibirRecordatoriosAniversarios: boolean;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '********',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @ApiProperty({
    description: 'Indica si el usuario es administrador',
    example: false,
    default: false,
  })
  @Column({ type: 'boolean', default: false })
  isAdmin?: boolean;

  @OneToMany(() => Donacion, (donacion) => donacion.DonacionUser, {
    onDelete: 'CASCADE',
  })
  donacion: Donacion;

  @ApiProperty({
    description: 'Publicaciones del usario',
  })
  @OneToMany(() => Publicacion, (publicacion) => publicacion.usuario, {
    onDelete: 'CASCADE',
    cascade: true,
  })
  publicaciones: Publicacion[];

  @ApiProperty({
    description: 'Mensajes a la virgen del usuario',
  })
  @OneToMany(() => MensajeAVirgen, (mensaje) => mensaje.usuario, {
    cascade: true,
  })
  mensajesAVirgen: MensajeAVirgen[];

  @ApiProperty({
    description: 'Inhumados asociados al usuario',
  })
  @OneToMany(
    () => UsuarioInhumado,
    (usuarioInhumado) => usuarioInhumado.usuario,
  )
  usuarioInhumados: UsuarioInhumado[];
}
