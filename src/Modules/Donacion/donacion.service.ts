import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Donacion } from 'src/Entities/donacion.entity';
import { Repository } from 'typeorm';
import { User } from 'src/Entities/user.entity';

@Injectable()
export class DonacionService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Donacion)
    private donacionRepository: Repository<Donacion>,
  ) {}

  async allDonations() {
    const donaciones = await this.donacionRepository.find();
    if (donaciones.length === 0)
      throw new BadRequestException('No hay donaciones');
    return donaciones;
  }
  async payMP(email: string, monto: number) {
    const findUser = await this.userRepository.findOne({
      where: { email },
    });

    if (!findUser) {
      throw new NotFoundException('No se encontró al usuario');
    }
    //CUERPO MP
    const body = {
      transaction_amount: monto,
      description: 'Donación',
      payer: {
        email: email,
      },
    };

    //POSTMP
    const mp = new Payment(
      new MercadoPagoConfig({ accessToken: 'TOKEN_MERCADO_PAGO' }),
    );
    console.log(mp);

    try {
      const paymentResponse = await mp.create({ body });
      console.log(paymentResponse);
      if (!paymentResponse) {
        throw new BadRequestException('No se pudo procesar el pago');
      }

      const donacion = new Donacion();
      donacion.Date = new Date();
      donacion.Estado = true;
      donacion.monto = monto;
      donacion.DonacionUser = findUser;

      await this.donacionRepository.save(donacion);

      return paymentResponse;
    } catch (error) {
      throw new BadRequestException(
        `Error al procesar el pago: ${error.message}`,
      );
    }
  }
}
