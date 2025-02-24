import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../DTO/RegisterUserDto';
import { LoginUserDto } from '../DTO/LoginUserDto';
import { User } from 'src/Entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de registro inválidos',
  })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createUser(@Body() userData: RegisterUserDto): Promise<User> {
    return await this.authService.register(userData);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async loginUser(@Body() auth: LoginUserDto) {
    return await this.authService.login(auth);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Iniciar autenticación con Google',
    description: 'Redirige al usuario a la página de login de Google',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección a Google',
  })
  async googleAuth() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Callback de autenticación Google',
    description: 'Endpoint que recibe la respuesta de autenticación de Google',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Conexión exitosa con Google',
        },
        user: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    //agregar async/await al redirigir a otra pagina
    const user = req.user;
    console.log('User authenticated via Google:', user);

    res.send({ message: 'Conexión exitosa con Google', user: user }); //modificar con URL de home
  }
  ///******///
  // Redirigir al frontend o devolver una respuesta
  // res.redirect('/dashboard'); // Cambia '/dashboard' por la ruta de tu frontend
}
