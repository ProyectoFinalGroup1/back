import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Logger,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { Donacion } from 'src/Entities/donacion.entity';
import { DonacionDto } from './donacionDTO';

@Controller('mercadopago')
export class DonacionController {
  private readonly logger = new Logger(DonacionController.name);

  constructor(private readonly donacionService: DonacionService) {}

  @Post('donar')
  @HttpCode(200)
  async donar(
    @Body(new ValidationPipe({ transform: true })) donacionDto: DonacionDto,
  ) {
    this.logger.log(`Procesando donación: ${JSON.stringify(donacionDto)}`);
    return this.donacionService.payMP(donacionDto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async allDonaciones(): Promise<Donacion[] | BadRequestException> {
    this.logger.log('Consultando todas las donaciones');
    return await this.donacionService.allDonations();
  }

  @Get('muro')
  async getDonacionesMuro() {
    this.logger.log('Consultando donaciones para el muro');
    return await this.donacionService.getDonacionesMuro();
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    this.logger.log('Recibida notificación de webhook');
    return await this.donacionService.handleWebhook(body);
  }
}
