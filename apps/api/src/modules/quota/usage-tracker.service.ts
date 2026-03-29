import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { DRIZZLE_SINGLETON } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsageTrackerService {
  private readonly logger = new Logger(UsageTrackerService.name);
  private readonly redis: Redis;

  constructor(
    @Inject(DRIZZLE_SINGLETON) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {
    this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  private getUsageKey(tenantId: string, metric: string): string {
    const month = new Date().toISOString().substring(0, 7); // YYYY-MM
    return `usage:${tenantId}:${metric}:${month}`;
  }

  async incrementUsage(tenantId: string, metric: string, amount: number = 1): Promise<number> {
    const key = this.getUsageKey(tenantId, metric);
    const newValue = await this.redis.incrby(key, amount);
    await this.redis.expire(key, 40 * 24 * 60 * 60);
    return newValue;
  }

  async getUsage(tenantId: string, metric: string): Promise<number> {
    const key = this.getUsageKey(tenantId, metric);
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncToPostgres() {
    this.logger.log('Sychronizing usage metrics from Redis to Postgres...');
  }
}
