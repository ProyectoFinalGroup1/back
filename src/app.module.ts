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

// Importar explícitamente todas las entidades
import { User } from './Entities/user.entity';
import { Donacion } from './Entities/donacion.entity';
import { Publicacion } from './Entities/publicaciones.entity';
import { MensajeAVirgen } from './Entities/mensajesVirgen.entity';
import { Inhumado } from './Entities/inhumados.entity';
import { UsuarioInhumado } from './Entities/usuario-inhumado.entity';

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
      // Importar explícitamente todas las entidades
      entities: [
        User,
        Donacion,
        Publicacion,
        MensajeAVirgen,
        Inhumado,
        UsuarioInhumado,
        // Mantener el patrón glob como respaldo
        'dist/**/*.entity{.ts,.js}',
      ],
      migrations: ['dist/migrations/*{.js,.ts}'],
      synchronize: true,
      migrationsRun: true,
      logging: true,
      autoLoadEntities: true, // Añadir esta opción para mayor seguridad
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
