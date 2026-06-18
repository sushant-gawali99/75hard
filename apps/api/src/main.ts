import 'dotenv/config';
import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { toNodeHandler } from 'better-auth/node';
import { json } from 'express';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { auth } from './auth/auth';

async function bootstrap() {
  // bodyParser disabled so Better Auth can read the raw request body.
  const app = await NestFactory.create(AppModule, { bufferLogs: true, bodyParser: false });
  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  // Mount Better Auth (raw body) before enabling JSON parsing for the rest.
  const server = app.getHttpAdapter().getInstance();
  server.all('/api/auth/{*path}', toNodeHandler(auth));
  app.use(json({ limit: '12mb' })); // meal photos arrive as base64

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  // Bind to 0.0.0.0 so the container is reachable on the platform network (Railway, etc.).
  await app.listen(port, '0.0.0.0');
  app.get(Logger).log(`Process API listening on port ${port}`);
}

void bootstrap();
