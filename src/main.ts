import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend en localhost:3001
  app.enableCors({
    origin: ['http://localhost:3001', 'https://deployfront-rouge.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Cementerio Parque Valle de Paz')
    .setDescription('Documentación del Cementerio Parque Valle de Paz')
    .setVersion('1.0')
    .addTag('Inhumados')
    .addTag('Files')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingresa tu token JWT aquí',
      },
      'Bearer',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch((err) =>
  console.error('Error starting the application:', err),
);
