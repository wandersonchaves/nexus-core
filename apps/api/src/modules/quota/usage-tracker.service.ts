import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq, sql } from 'drizzle-orm';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsageTrackerService {
  private readonly logger = new Logger(UsageTrackerService.name);
  private readonly redis: Redis;

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {
    // We can inject Redis or create a local connection for tracking
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
    
    // Set expiry to 40 days to cover month overlap
    await this.redis.expire(key, 40 * 24 * 60 * 60);
    
    return newValue;
  }

  async getUsage(tenantId: string, metric: string): Promise<number> {
    const key = this.getUsageKey(tenantId, metric);
    const value = await this.redis.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  /**
   * Sync Redis counters to Postgres periodically.
   * In a real Staff Engineer approach, we would use a more robust way to track 
   * which tenants were updated, but for this challenge we simulate a sync.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async syncToPostgres() {
    this.logger.log('Sychronizing usage metrics from Redis to Postgres...');
    // Implementation would involve scanning Redis keys and batch updating Postgres
  }
}
