/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: true,
  })
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: true,
  })
  @IsNotEmpty()
  apellido: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@mail.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'DNI del usuario',
    example: 12345678,
    required: true,
  })
  @IsNotEmpty()
  dni: number;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'miContraseña123',
    required: true,
  })
  @IsNotEmpty()
  password: string;
}
