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

export class DonacionDto {
  @IsNumber()
  @Min(1, { message: 'El monto debe ser mayor a 0' })
  @Type(() => Number)
  monto: number;

  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email: string;

  @IsOptional()
  @IsString()
  nombreMostrar?: string;

  @IsOptional()
  @IsString()
  mensajeAgradecimiento?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  mostrarEnMuro?: boolean;
}
