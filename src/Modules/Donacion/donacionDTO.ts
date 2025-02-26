// src/Modules/donacion/dto/donacion.dto.ts
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DonacionDto {
  @ApiProperty({
    description: 'Monto de la donación, debe ser mayor a 0',
    example: 100,
  })
  @IsNumber()
  @Min(1, { message: 'El monto debe ser mayor a 0' })
  @Type(() => Number)
  monto: number;

  @ApiProperty({
    description: 'Email del donante, debe ser un email válido',
    example: 'donante@example.com',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @ApiProperty({
    description: 'Nombre a mostrar del donante (opcional)',
    example: 'Juan Pérez',
    required: false,
  })
  @IsOptional()
  @IsString()
  nombreMostrar?: string;

  @ApiProperty({
    description: 'Mensaje de agradecimiento (opcional)',
    example: 'Gracias por tu generosidad',
    required: false,
  })
  @IsOptional()
  @IsString()
  mensajeAgradecimiento?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  mostrarEnMuro?: boolean;
}
