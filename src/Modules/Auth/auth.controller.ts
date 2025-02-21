import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from '../DTO/RegisterUserDto';
import { LoginUserDto } from '../DTO/LoginUserDto';
import { User } from 'src/Entities/user.entity';

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
}
