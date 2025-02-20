/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const ReqAuth = request.headers.authorization;
    if (!ReqAuth) {
      throw new UnauthorizedException('No esta autorizado a ingresar ');
    }
    const token = ReqAuth.split(' ')[1];
    if (!token)
      throw new UnauthorizedException('No esta autorizado a ingresar');

    try {
      const secret = process.env.JWT_SECRET;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const payload = this.jwtService.verify(token, { secret });
      payload.iat = new Date(payload.iat * 1000);
      payload.exp = new Date(payload.exp * 1000);
      request.user = payload;
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException(
        'No cuenta con los permisos necesarios para acceder a esta ruta ',
      );
    }
  }
}
