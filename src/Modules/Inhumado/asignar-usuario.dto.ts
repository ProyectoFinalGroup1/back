import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarUsuarioDto {
  @ApiProperty({
    description: 'ID del usuario que se asignará al inhumado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  usuarioId: string;
}
