import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const config = app.get(AppConfigService);

  app.useLogger(app.get(PinoLogger));
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  // Nginx arkasındayken gerçek istemci IP'si X-Forwarded-For'dan okunur;
  // rate limit aksi hâlde tüm trafiği tek IP sanar.
  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Not: global ValidationPipe kurulmaz — gövde/query doğrulaması Zod'un
  // ZodValidationPipe'ında (app.module.ts) yapılır. ParseUUIDPipe gibi tekil
  // parametre pipe'ları kendi başlarına çalışır.

  if (config.swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Burak Gemici — Portfolio API')
        .setDescription(
          'Portfolyo içeriğini yöneten REST API. Herkese açık uçlar site içeriğini sunar; ' +
            'yazma işlemleri JWT ile korunur.',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .build(),
    );

    // Zod DTO'larını OpenAPI şemalarına çevirir: doğrulama kuralı ile
    // dokümantasyon aynı kaynaktan üretilir, ayrışamazlar.
    SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document), {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(config.port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API hazır → http://localhost:${config.port}/api`);

  if (config.swaggerEnabled) {
    logger.log(`Swagger → http://localhost:${config.port}/docs`);
  }
}

void bootstrap();
