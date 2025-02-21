import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class userService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUsers(): Promise<User[] | NotFoundException> {
    const allUsers = await this.userRepository.find();
    if (!allUsers) {
      throw new NotFoundException('No se encontraron los usuarios ');
    }
    return allUsers;
  }

  async userFind(id: string): Promise<User> {
    const findUser = await this.userRepository.findOneBy({ idUser: id });
    if (!findUser) {
      throw new NotFoundException('No se encontro el usuario');
    }
    return findUser;
  }

  async updateUser(idUser: string, dataUser: Partial<User>): Promise<User> {
    const findUser = await this.userRepository.findOneBy({ idUser });
    if (!findUser) {
      throw new NotFoundException('No se encontro el usuario');
    }
    const updateUser = Object.assign(findUser, dataUser);
    return await this.userRepository.save(updateUser);
  }

  async deleteUser(id: string) {
    const findUser = await this.userRepository.findOne({
      where: { idUser: id },
    });
    if (!findUser) {
      throw new NotFoundException('No se encontro usuario');
    }
    const deleteUser = await this.userRepository.remove(findUser);
    if (!deleteUser) {
      throw new BadRequestException('No se pudo eliminar usuario');
    }
    return { message: 'Usuario eliminado exitosamente' };
  }
}
