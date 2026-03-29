import { otelSDK } from './otel-sdk';
// Initialize OpenTelemetry SDK before NestJS starts
otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  process.setMaxListeners(20);
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use nestjs-pino for structured JSON logs
  app.useLogger(app.get(Logger));

  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
