import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../DTO/RegisterUserDto';
import { LoginUserDto } from '../DTO/LoginUserDto';
import { User } from 'src/Entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async createUser(@Body() userData: RegisterUserDto): Promise<User> {
    return await this.authService.register(userData);
  }

  @Post('signin')
  async loginUser(@Body() auth: LoginUserDto) {
    return await this.authService.login(auth);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Inicia la autenticación con Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    //agregar async/await al redirigir a otra pagina
    const user = req.user;
    console.log('User authenticated via Google:', user);

    res.send({ message: 'Conexión exitosa con Google', user: user });
  }
  ///******///
  // Redirigir al frontend o devolver una respuesta
  // res.redirect('/dashboard'); // Cambia '/dashboard' por la ruta de tu frontend
}
