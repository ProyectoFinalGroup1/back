import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePublicacionDto {
  @IsUUID()
  @IsNotEmpty()
  usuarioId: string;

  @IsUUID()
  @IsNotEmpty()
  inhumadoId: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}
