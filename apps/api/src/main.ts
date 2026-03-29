// import { otelSDK } from './otel-sdk';
// otelSDK.start();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  process.setMaxListeners(20);
  console.log(`[BOOTSTRAP] Current NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    const app = await NestFactory.create(AppModule, { 
      bufferLogs: true,
      abortOnError: false
    });

    app.useLogger(app.get(Logger));

    const port = process.env.PORT || 3333;
    await app.listen(port);
    
    // O logger pino já estará ativo aqui
    const logger = app.get(Logger);
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('[CRITICAL BOOTSTRAP ERROR]:', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('[FATAL STARTUP ERROR]:', err);
  process.exit(1);
});
