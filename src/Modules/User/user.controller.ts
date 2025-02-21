import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from 'src/Entities/user.entity';
import { userService } from './user.service';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { Role } from '../Guards/Roles/roles.enum';
import { Roles } from '../Guards/Roles/roles.decorator';
import { RolesGuard } from '../Guards/Roles/Roles.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: userService) {}

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async allUsers() {
    return await this.userService.getUsers();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async userById(id: string): Promise<User> {
    return await this.userService.userFind(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async UpdateUser(
    @Param('id') idUser: string,
    @Body() dataUser: Partial<User>,
  ) {
    return await this.userService.updateUser(idUser, dataUser);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
