import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
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

  app.use('/imagens', (req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = getAllowedOrigins();

    console.log(`🖼️ Requisição de imagem - Origin: ${origin || 'NONE'}`);
    console.log(`📋 Origens permitidas: ${allowedOrigins.join(', ')}`);

    if (!origin || allowedOrigins.includes(origin)) {
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        console.log(`✅ CORS permitido para: ${origin}`);
      } else {
        console.log('✅ Requisição direta (sem origin) permitida');
      }
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, Range',
      );
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      console.log(`🚫 CORS bloqueado para: ${origin}`);
    }

    // Headers de segurança
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    // Responder ao preflight
    if (req.method === 'OPTIONS') {
      console.log('🔄 Respondendo a preflight de imagem');
      res.status(200).end();
      return;
    }

    next();
  });

  app.useStaticAssets(join(process.cwd(), 'imagens'), {
    prefix: '/imagens/',
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

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
