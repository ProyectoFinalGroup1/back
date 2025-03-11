import './crypto-polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morgan('dev'));
  app.use(helmet());
  // Habilitar CORS para permitir peticiones desde el frontend en localhost:3001
  app.enableCors({
    origin: ['http://localhost:3001', 'https://deployfront-rouge.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuración de CSP usando Helmet
  app.use((req, res, next) => {
    res.header(
      'Content-Security-Policy',
      `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: mercadopago.com.br *.mercadopago.com.br mercadopago.com *.mercadopago.com mercadopago.com.co *.mercadopago.com.co js-agent.newrelic.com *.js-agent.newrelic.com siteintercept.qualtrics.com *.siteintercept.qualtrics.com http2.mlstatic.com *.http2.mlstatic.com googletagmanager.com *.googletagmanager.com google.com *.google.com www.google.com mercadopago.cl *.mercadopago.cl mercadopago.com.mx *.mercadopago.com.mx hotjar.com *.hotjar.com mercadopago.com.pe *.mercadopago.com.pe mercadopago.com.uy *.mercadopago.com.uy mercadopago.com.ar *.mercadopago.com.ar static.hotjar.com *.static.hotjar.com mercadopago.com.ve *.mercadopago.com.ve newrelic.com *.newrelic.com www.gstatic.com gstatic.com *.gstatic.com recaptcha.google.com *.recaptcha.google.com www.recaptcha.google.com;
      connect-src 'self' mercadopago.com *.mercadopago.com api.mercadopago.com google.com *.google.com gstatic.com *.gstatic.com www.gstatic.com recaptcha.google.com *.recaptcha.google.com www.recaptcha.google.com apis.google.com *.apis.google.com http2.mlstatic.com *.http2.mlstatic.com;
      frame-src 'self' mercadopago.com *.mercadopago.com recaptcha.google.com *.recaptcha.google.com www.recaptcha.google.com google.com *.google.com www.google.com http2.mlstatic.com *.http2.mlstatic.com;
      img-src 'self' data: mercadopago.com *.mercadopago.com google.com *.google.com gstatic.com *.gstatic.com;
      style-src 'self' 'unsafe-inline' mercadopago.com *.mercadopago.com google.com *.google.com gstatic.com *.gstatic.com;
      font-src 'self' data: mercadopago.com *.mercadopago.com gstatic.com *.gstatic.com;
    `
        .replace(/\s+/g, ' ')
        .trim(),
    );
    next();
  });

  // Puedes mantener Helmet para otras configuraciones de seguridad
  app.use(
    helmet({
      contentSecurityPolicy: false, // Deshabilita la CSP de Helmet ya que la configuramos manualmente
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
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      filter: true,
      syntaxHighlight: {
        activated: true,
        theme: 'agate',
      },
    },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap().catch((err) =>
  console.error('Error starting the application:', err),
);
