/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/Entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from '../DTO/RegisterUserDto';
import { Role } from '../Guards/Roles/roles.enum';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(userData: RegisterUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { nombre, apellido, email, dni, password } = userData;
    const userExisting = await this.userRepository.findOne({
      where: { email: email },
    });
    if (userExisting) {
      throw new BadRequestException('Email ya registrado');
    }
    const hashPass = await bcrypt.hash(userData.password, 10);
    if (!hashPass) {
      throw new BadRequestException('Credenciales no admitidas');
    }
    const dniExists = await this.userRepository.findOne({
      where: { dni: dni },
    });
    if (dniExists) {
      throw new BadRequestException('DNI ya registrado');
    }

    const newUser = this.userRepository.create({
      nombre: nombre,
      apellido: apellido,
      email: email,
      dni: dni,
      password: hashPass,
    });
    console.log('este es el usuario que creamos', newUser);
    const user = await this.userRepository.save(newUser);

    // Enviar email de bienvenida
    await this.emailService.sendWelcomeEmail(userData.email, userData.nombre);

    return user;
  }

  async login(auth: { email: string; password: string }) {
    const { email, password } = auth;
    const userExisting = await this.userRepository.findOne({
      where: { email },
    });
    if (!userExisting) {
      throw new NotFoundException('Email no registrado');
    }
    const isPasswordValid = await bcrypt.compare(
      password,
      userExisting.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Credenciales invalidas');
    }

    const firma = {
      sub: userExisting.idUser,
      email: userExisting.email,
      roles: [userExisting.isAdmin ? Role.Admin : Role.User],
    };
    const token = this.jwtService.sign(firma);
    const decodedToken = this.jwtService.decode(token) as {
      iat: number;
      exp: number;
    };
    return {
      message: `Ingreso exitoso : ${userExisting.nombre}!`,
      token,
      iat: new Date(decodedToken.iat * 1000),
      exp: new Date(decodedToken.exp * 1000),
      userExisting,
    };
  }
}
