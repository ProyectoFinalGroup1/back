import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors();

  // Configuración de Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Cementerio Parque Valle de Paz')
    .setDescription('Documentación del Cementerio Parque Valle de Paz')
    .setVersion('1.0')
    .addTag('Inhumados')
    .addTag('Files')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Usar variable de entorno PORT
  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Loguear la URL después de que el servidor haya iniciado
  const url = await app.getUrl();
  console.log(`Application is running on: ${url}`);
}
bootstrap();
