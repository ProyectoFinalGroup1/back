import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { Donacion } from 'src/Entities/donacion.entity';

@Controller('mercadopago')
export class DonacionController {
  constructor(private readonly donacionService: DonacionService) {}

  @Post()
  async donar(@Body() monto: number, email: string) {
    return this.donacionService.payMP(email, monto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async allDonaciones(): Promise<Donacion[] | BadRequestException> {
    return await this.donacionService.allDonations();
  }

  //prueba
  // @Get('test-user')
  // async createTestUser() {
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  //   return this.mercadopagoService.createTestUser();
  // }
}
