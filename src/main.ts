import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir arquivos estáticos da pasta imagens
  app.useStaticAssets(join(__dirname, '..', 'imagens'), {
    prefix: '/imagens/',
  });

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://escritorio-dnascimento.cloud',
      'https://www.escritorio-dnascimento.cloud',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 204,
  });

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
