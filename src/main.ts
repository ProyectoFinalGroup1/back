import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir peticiones desde el frontend en localhost:3001
  app.enableCors({
    origin: ['http://localhost:3001', 'https://deployfront-rouge.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de CSP usando Helmet
  // Configuración de CSP usando Helmet - CORREGIDA
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'blob:',
          'mercadopago.com.br',
          '*.mercadopago.com.br',
          'mercadopago.com',
          '*.mercadopago.com',
          'mercadopago.com.co',
          '*.mercadopago.com.co',
          'js-agent.newrelic.com',
          '*.js-agent.newrelic.com',
          'siteintercept.qualtrics.com',
          '*.siteintercept.qualtrics.com',
          'http2.mlstatic.com',
          '*.http2.mlstatic.com',
          'googletagmanager.com',
          '*.googletagmanager.com',
          'google.com',
          '*.google.com',
          'mercadopago.cl',
          '*.mercadopago.cl',
          'mercadopago.com.mx',
          '*.mercadopago.com.mx',
          'hotjar.com',
          '*.hotjar.com',
          'mercadopago.com.pe',
          '*.mercadopago.com.pe',
          'mercadopago.com.uy',
          '*.mercadopago.com.uy',
          'mercadopago.com.ar',
          '*.mercadopago.com.ar',
          'static.hotjar.com',
          '*.static.hotjar.com',
          'mercadopago.com.ve',
          '*.mercadopago.com.ve',
          'newrelic.com',
          '*.newrelic.com',
          // Agregar los dominios faltantes para reCAPTCHA
          'www.gstatic.com',
          'gstatic.com',
          '*.gstatic.com',
          'recaptcha.google.com',
          '*.recaptcha.google.com',
        ],
        connectSrc: [
          "'self'",
          'mercadopago.com',
          '*.mercadopago.com',
          'api.mercadopago.com',
        ],
        frameSrc: [
          "'self'",
          'mercadopago.com',
          '*.mercadopago.com',
          'recaptcha.google.com',
          '*.recaptcha.google.com',
          'google.com',
          '*.google.com',
        ],
        imgSrc: ["'self'", 'data:', 'mercadopago.com', '*.mercadopago.com'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'mercadopago.com',
          '*.mercadopago.com',
        ],
        fontSrc: ["'self'", 'data:', 'mercadopago.com', '*.mercadopago.com'],
      },
      reportOnly: false, // Cambiar a false para aplicar la política en lugar de solo reportar
    }),
  );

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
