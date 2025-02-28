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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: userService) {}

  @ApiOperation({ summary: 'Obtener todos los usuarios' }) // 3. Describe la operación
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: [User],
  })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async allUsers() {
    return await this.userService.getUsers();
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del usuario' }) // 5. Describe el parámetro
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: User,
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async userById(@Param('id') id: string) {
    return await this.userService.userFind(id);
  }

  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: User,
  })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Put(':id')
  async UpdateUser(
    @Param('id') idUser: string,
    @Body() dataUser: Partial<User>,
  ) {
    return await this.userService.updateUser(idUser, dataUser);
  }

  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario a eliminar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
