// src/Modules/UsuarioInhumado/dto/crear-usuario-inhumado.dto.ts
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearUsuarioInhumadoDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  usuarioId: string;

  @ApiProperty({
    description: 'ID del inhumado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  inhumadoId: string;
}
