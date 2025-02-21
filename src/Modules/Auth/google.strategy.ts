/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // Comprobamos si las variables de entorno están definidas
    if (!clientID || !clientSecret) {
      throw new Error('Google Client ID and Client Secret are required!');
    }

    super({
      clientID,
      clientSecret,
      callbackURL: 'http://localhost:3000/auth/google/redirect',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;

    // Mapeo de los datos de Google a la entidad User
    const userData = {
      email: emails[0].value, // Email de Google
      nombre: name.firstName, // Nombre (First name) de Google
      apellido: name.lastName || 'Desconocido', // Apellido (Last name) de Google
      password: ' ',
      //dni:

      //crea un problema dejar sin contrase;a a usuario creado con google, se podria logear solo con correo y password vacio
    };

    // Buscar si el usuario ya existe
    let user = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (!user) {
      // Si no existe, creamos un nuevo usuario
      user = this.userRepository.create(userData);
      if (!user) throw new BadRequestException('No se pudo cargar datos');
      await this.userRepository.save(user);
    }

    // Devolvemos el usuario al sistema
    done(null, user);
  }
}
