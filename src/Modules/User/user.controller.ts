import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { UpdateUserPreferencesDto } from '../DTO/UpdateUserPreferencesDto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@ApiBearerAuth('Bearer')
@Controller('user')
export class UserController {
  constructor(private readonly userService: userService) {}

  @ApiOperation({ summary: 'Obtener todos los usuarios' })
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

  @Patch(':id/preferences')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Actualizar preferencias de notificaciones del usuario',
  })
  async updatePreferences(
    @Param('id') idUser: string,
    @Body() preferencesDto: UpdateUserPreferencesDto,
  ) {
    return await this.userService.updatePreferences(idUser, preferencesDto);
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

  @ApiOperation({ summary: 'Subir imagen de perfil para user' })
  @Post('uploadImmagenPerfil/:userId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImgPerfil(
    @Param('userId', ParseUUIDPipe) userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000,
            message: 'El tamaño de la imagen debe ser inferior a 2MB',
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadImgPerfil(file, userId);
  }
}
