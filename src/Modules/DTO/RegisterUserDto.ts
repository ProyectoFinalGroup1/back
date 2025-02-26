import { IsEmail, IsNotEmpty, Matches, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MatchPassword } from '../Guards/Validates/MatchPassword';

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
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}$/,
    {
      message:
        'La contraseña debe tener al menos 5 caracteres, una mayúscula, una minúscula, un número y un carácter especial.',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'miContraseña123',
    required: true,
  })
  @IsNotEmpty()
  @Validate(MatchPassword, ['password'])
  passwordConfirm: string;
}
