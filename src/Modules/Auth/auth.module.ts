import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { MatchPassword } from '../Guards/Validates/MatchPassword';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    // implementacion google
    PassportModule.register({ defaultStrategy: 'google' }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, MatchPassword],
  exports: [AuthService],
})
export class AuthModule {}
