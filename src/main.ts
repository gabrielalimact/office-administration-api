import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { getAllowedOrigins } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = getAllowedOrigins();

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(
          `🚫 CORS bloqueou requisição de origem não permitida: ${origin}`,
        );
        console.log(`📋 Origens permitidas: ${allowedOrigins.join(', ')}`);
        callback(new Error('Não permitido pelo CORS'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
    ],
    exposedHeaders: ['Content-Length', 'X-Content-Range'],
    credentials: true,
    maxAge: isProduction ? 86400 : 3600,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  app.useStaticAssets(join(process.cwd(), 'imagens'), {
    prefix: '/imagens/',
    setHeaders: (res) => {
      if (isProduction) {
        res.set(
          'Access-Control-Allow-Origin',
          'https://escritorio-dnascimento.cloud',
        );
        res.set(
          'Access-Control-Allow-Origin',
          'https://www.escritorio-dnascimento.cloud',
        );
      } else {
        res.set('Access-Control-Allow-Origin', '*');
      }
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Accept');

      res.set('X-Content-Type-Options', 'nosniff');
      res.set('Cache-Control', 'public, max-age=31536000');
    },
  });

  if (isProduction) {
    app.use((req, res, next) => {
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; img-src 'self' data: https:; script-src 'self'",
      );
      next();
    });
  }

  const config = new DocumentBuilder()
    .setTitle('Office Administration API')
    .setDescription('API for managing office administration tasks')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
