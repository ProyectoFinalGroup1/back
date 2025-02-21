/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty()
  nombre: string;

  @IsNotEmpty()
  apellido: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  dni: number;

  @IsNotEmpty()
  password: string;
}
