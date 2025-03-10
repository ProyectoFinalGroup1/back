import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePublicacionDto {
  @ApiProperty({
    description: 'ID del usuario que crea la publicación',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({
    description: 'ID del inhumado relacionado con la publicación',
    example: '123e4567-e89b-12d3-a456-426614174001',
    type: String,
  })
  @IsUUID()
  @IsNotEmpty()
  inhumadoId: string;

  @ApiProperty({
    description: 'Mensaje o contenido de la publicación',
    example: 'En memoria de un ser querido...',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @ApiPropertyOptional({
    description:
      'URL o referencia de la imagen asociada a la publicación (opcional)',
    example: 'https://ejemplo.com/imagen.jpg',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imagen?: string | undefined;
}
