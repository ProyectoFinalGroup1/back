import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseModule } from './Config/supabase.module';
import { InhumadosModule } from './Modules/Inhumado/inhumado.module';
import { UserModule } from './Modules/User/user.module';
import { AuthModule } from './Modules/Auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { FileUploadModule } from './Modules/file-upload/file-upload.module';
import { DialogflowModule } from './Modules/chatbot/dialogflow.module';
import { PublicacionesModule } from './Modules/publicaciones/publi.module';
import { MensajesVirgenModule } from './Modules/mensajesVirgen/menVir.module';
import { DonacionModule } from './Modules/Donacion/donacion.module';
import { ReminderModule } from './Modules/recordatorios/reminder.module';
import { UsuarioInhumadoModule } from './Modules/UsuarioInhumado/usuario-inhumado.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'src/Config/.env',
    }),
    SupabaseModule,
    InhumadosModule,
    PublicacionesModule,
    MensajesVirgenModule,
    UserModule,
    AuthModule,
    DialogflowModule,
    FileUploadModule,
    DonacionModule,
    ReminderModule,
    UsuarioInhumadoModule,
    ScheduleModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['dist/migrations/*{.js,.ts}'],
      synchronize: true,
      migrationsRun: true,
      logging: true,
    }),
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1h' },
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
