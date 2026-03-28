import { Controller, Get, Injectable, Inject } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DRIZZLE } from '../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../database/schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { sql } from 'drizzle-orm';
import type { ILLMProvider } from '../../growth/domain/interfaces';

@Injectable()
export class DrizzleHealthIndicator extends HealthIndicator {
  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('Database check failed', this.getStatus(key, false, { message: e.message }));
    }
  }
}

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@InjectQueue('messaging') private readonly queue: Queue) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = await this.queue.client;
      const status = await client.ping();
      return this.getStatus(key, status === 'PONG');
    } catch (e) {
      throw new HealthCheckError('Redis check failed', this.getStatus(key, false, { message: e.message }));
    }
  }
}

@Injectable()
export class OpenAiHealthIndicator extends HealthIndicator {
  constructor(@Inject('ILLMProvider') private readonly llmProvider: ILLMProvider) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Simulating a light check or availability verify
    try {
      const isAvailable = !!this.llmProvider;
      return this.getStatus(key, isAvailable);
    } catch (e) {
      throw new HealthCheckError('OpenAI provider check failed', this.getStatus(key, false, { message: e.message }));
    }
  }
}

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private drizzleHealth: DrizzleHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private openAiHealth: OpenAiHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.drizzleHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis_bullmq'),
      () => this.openAiHealth.isHealthy('llm_provider'),
    ]);
  }
}
