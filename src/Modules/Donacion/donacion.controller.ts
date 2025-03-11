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
  Param,
} from '@nestjs/common';
import { DonacionService } from './donacion.service';
import { Roles } from '../Guards/Roles/roles.decorator';
import { Role } from '../Guards/Roles/roles.enum';
import { AuthGuard } from '../Guards/Jwt/AuthGuards';
import { RolesGuard } from '../Guards/Roles/Roles.guard';
import { Donacion } from 'src/Entities/donacion.entity';
import { DonacionDto } from './donacionDTO';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Donaciones')
@Controller('mercadopago')
export class DonacionController {
  private readonly logger = new Logger(DonacionController.name);

  constructor(private readonly donacionService: DonacionService) {}

  @Post('donar')
  @HttpCode(200)
  @ApiOperation({ summary: 'Realizar una donación' })
  @ApiResponse({ status: 200, description: 'Donación procesada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en la donación.' })
  async donar(
    @Body(
      new ValidationPipe({
        transform: true,
        skipMissingProperties: true, // Permite omitir propiedades faltantes
        forbidNonWhitelisted: false, // No rechaza propiedades no listadas
      }),
    )
    donacionDto: DonacionDto,
  ) {
    // Verificar que el email no esté vacío
    if (!donacionDto.email || donacionDto.email.trim() === '') {
      throw new BadRequestException(
        'Debe proporcionar un email válido para procesar la donación',
      );
    }
    this.logger.log(`Procesando donación: ${JSON.stringify(donacionDto)}`);
    return this.donacionService.payMP(donacionDto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('ALLdonaciones')
  @ApiOperation({ summary: 'Obtener todas las donaciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de donaciones.',
    type: [Donacion],
  })
  @ApiResponse({ status: 400, description: 'Error al obtener las donaciones.' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para esta acción.',
  })
  async allDonaciones(): Promise<Donacion[] | BadRequestException> {
    this.logger.log('Consultando todas las donaciones');
    return await this.donacionService.allDonations();
  }
  @Get('donaciones-aprobadas/:userId')
  @ApiOperation({ summary: 'Obtener donaciones aprobadas por ID de usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de donaciones aprobadas del usuario.',
    type: [Donacion],
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron donaciones aprobadas para este usuario.',
  })
  async getDonacionesAprobadasByUserId(@Param('userId') userId: string) {
    this.logger.log(
      `Consultando donaciones aprobadas del usuario con ID: ${userId}`,
    );
    return await this.donacionService.getDonacionesAprobadasByUserId(userId);
  }

  @Get('muro')
  @ApiOperation({ summary: 'Obtener donaciones para el muro' })
  @ApiResponse({
    status: 200,
    description: 'Lista de donaciones para el muro.',
  })
  async getDonacionesMuro() {
    this.logger.log('Consultando donaciones para el muro');
    return await this.donacionService.getDonacionesMuro();
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Manejar notificaciones de webhook' })
  @ApiResponse({ status: 200, description: 'Webhook procesado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al procesar el webhook.' })
  async handleWebhook(@Body() body: any) {
    this.logger.log('Recibida notificación de webhook');
    return await this.donacionService.handleWebhook(body);
  }
}
