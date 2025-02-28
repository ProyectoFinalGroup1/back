import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateInhumadoDto {
  @ApiProperty({ description: 'Apellido del inhumado' })
  @IsNotEmpty()
  @IsString()
  apellido: string;

  @ApiProperty({ description: 'Nombre del inhumado' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Fecha de nacimiento' })
  @IsNotEmpty()
  @IsString()
  fnac: string;

  @ApiProperty({ description: 'Fecha de fallecimiento' })
  @IsNotEmpty()
  @IsString()
  ffal: string;

  @ApiProperty({ description: 'Valle' })
  @IsNotEmpty()
  @IsString()
  valle: string;

  @ApiProperty({ description: 'Sector' })
  @IsNotEmpty()
  @IsString()
  sector: string;

  @ApiProperty({ description: 'Número de manzana' })
  @IsNotEmpty()
  @IsNumber()
  manzana: number;

  @ApiProperty({ description: 'Número de parcela' })
  @IsNotEmpty()
  @IsNumber()
  parcela: number;

  @ApiProperty({ description: 'Símbolo identificativo' })
  @IsNotEmpty()
  @IsNumber()
  simbolo: number;

  @ApiProperty({ description: 'Número de cliente' })
  @IsNotEmpty()
  @IsNumber()
  ncliente: number;

  @ApiProperty({
    description: 'URL de la imagen del inhumado',
    example: 'https://example.com/image.jpg',
  })
  @IsOptional()
  @IsString()
  imagenUrl?: string;
}
