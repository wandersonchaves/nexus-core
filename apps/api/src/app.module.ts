import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { LoggerModule } from 'nestjs-pino';
import { MessagingModule } from './modules/messaging/messaging.module';
import { GrowthModule } from './growth/growth.module';
import { HealthModule } from './infrastructure/health/health.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { QuotaModule } from './modules/quota/quota.module';
import { TenantMiddleware } from './infrastructure/database/tenant.middleware';
import { AllExceptionsFilter } from './infrastructure/filters/all-exceptions.filter';
import { PerformanceInterceptor } from './infrastructure/interceptors/performance.interceptor';
import { QuotaGuard } from './modules/quota/quota.guard';
import { v4 as uuidv4 } from 'uuid';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
        genReqId: (req) => req.headers['x-request-id'] || uuidv4(),
        customProps: (req) => ({
          tenant_id: req.headers['x-tenant-id'],
        }),
      },
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{
        name: 'short',
        ttl: 1000,
        limit: 10,
      }],
      storage: new ThrottlerStorageRedisService({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      }),
    }),
    HealthModule,
    MessagingModule,
    GrowthModule,
    TenantsModule,
    OnboardingModule,
    QuotaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: QuotaGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
