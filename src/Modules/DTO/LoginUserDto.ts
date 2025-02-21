import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    description: 'Correo electrónico registrado',
    example: 'juan.perez@mail.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña de la cuenta',
    example: 'miContraseña123',
    required: true,
  })
  @IsNotEmpty()
  password: string;
}
