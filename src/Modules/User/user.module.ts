import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { UserController } from './user.controller';
import { userService } from './user.service';
import { Donacion } from 'src/Entities/donacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Donacion])],
  controllers: [UserController],
  providers: [userService],
})
export class UserModule {}
