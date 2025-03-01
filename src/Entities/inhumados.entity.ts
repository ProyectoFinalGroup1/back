import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Publicacion } from './publicaciones.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UsuarioInhumado } from './usuario-inhumado.entity';

@Entity('inhumados')
export class Inhumado {
  @ApiProperty({
    description: 'ID único del inhumado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Apellido del inhumado',
    example: 'González',
  })
  @Column()
  apellido: string;

  @ApiProperty({
    description: 'Nombre del inhumado',
    example: 'Juan Carlos',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '15 de Enero de 1950',
  })
  @Column()
  fnac: string;

  @ApiProperty({
    description: 'Fecha de fallecimiento',
    example: '20 de Diciembre de 2020',
  })
  @Column()
  ffal: string;

  @ApiProperty({
    description: 'Valle',
    example: 'Valle 1',
  })
  @Column()
  valle: string;

  @ApiProperty({
    description: 'Sector',
    example: 'Sector 1',
  })
  @Column()
  sector: string;

  @ApiProperty({
    description: 'URL de la imagen del inhumado',
    example: 'https://example.com/image.jpg',
  })
  @Column({ nullable: true })
  imagenUrl: string;

  @ApiProperty({
    description: 'Número de manzana',
    example: 5,
  })
  @Column()
  manzana: number;

  @ApiProperty({
    description: 'Número de parcela',
    example: 10,
  })
  @Column()
  parcela: number;

  @ApiProperty({
    description: 'Símbolo identificativo',
    example: 1,
  })
  @Column()
  simbolo: number;

  @ApiProperty({
    description: 'Número de cliente',
    example: 1234,
  })
  @Column()
  ncliente: number;

  @OneToMany(() => Publicacion, (publicacion) => publicacion.inhumado, {
    onDelete: 'CASCADE',
  })
  publicaciones: Publicacion[];

  //agregar una referencia al usuario en la entidad Inhumado
  @ApiProperty({
    description: 'Usuario asociado al inhumado',
    required: false,
  })
  @OneToMany(
    () => UsuarioInhumado,
    (usuarioInhumado) => usuarioInhumado.inhumado,
  )
  usuarioInhumados: UsuarioInhumado[];
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ nullable: true })
  usuario_id: string;
}
