// src/Modules/DTO/UpdateUserPreferencesDto.ts
import { IsBoolean, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class UpdateUserPreferencesDto {
  @ApiProperty({
    description: 'Preferencia para recibir recordatorios de aniversarios',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  recibirRecordatoriosAniversarios?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  fechaPago?: Date;

  // Puedes añadir más preferencias aquí en el futuro
}
