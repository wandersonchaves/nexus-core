import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController, DrizzleHealthIndicator, RedisHealthIndicator, OpenAiHealthIndicator } from './health.controller';
import { DatabaseModule } from '../database/database.module';
import { MessagingModule } from '../../modules/messaging/messaging.module';
import { GrowthModule } from '../../growth/growth.module';

@Module({
  imports: [
    TerminusModule,
    DatabaseModule,
    MessagingModule,
    GrowthModule,
  ],
  controllers: [HealthController],
  providers: [
    DrizzleHealthIndicator,
    RedisHealthIndicator,
    OpenAiHealthIndicator,
  ],
})
export class HealthModule {}
