import { CanActivate, ExecutionContext, Injectable, Inject, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import { UsageTrackerService } from './usage-tracker.service';
import { SetMetadata } from '@nestjs/common';

export const CHECK_QUOTA = 'check_quota';
export const Quota = (metric: 'leads' | 'messages' | 'tokens') => SetMetadata(CHECK_QUOTA, metric);

@Injectable()
export class QuotaGuard implements CanActivate {
  private readonly logger = new Logger(QuotaGuard.name);

  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly usageTracker: UsageTrackerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.get<string>(CHECK_QUOTA, context.getHandler());
    if (!metric) return true;

    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new ForbiddenException('Tenant ID is required for this action.');
    }

    // 1. Get current limits for this tenant (Real-time from DB to ensure it's dynamic)
    // Staff suggestion: Cache this in Redis for 5 mins if high traffic
    const [tenant] = await this.db
      .select({
        maxLeads: schema.tenants.maxLeads,
        maxMessagesMonth: schema.tenants.maxMessagesMonth,
        aiTokensLimit: schema.tenants.aiTokensLimit,
      })
      .from(schema.tenants)
      .where(eq(schema.tenants.id, tenantId))
      .limit(1);

    if (!tenant) {
      throw new ForbiddenException('Tenant not found.');
    }

    // 2. Check current usage
    const currentUsage = await this.usageTracker.getUsage(tenantId, metric);

    let limit = 0;
    if (metric === 'leads') limit = tenant.maxLeads;
    if (metric === 'messages') limit = tenant.maxMessagesMonth;
    if (metric === 'tokens') limit = tenant.aiTokensLimit;

    if (currentUsage >= limit) {
      this.logger.warn(`Tenant ${tenantId} hit ${metric} quota limit: ${currentUsage}/${limit}`);
      throw new ForbiddenException(`Quota exceeded for ${metric}. Current usage: ${currentUsage}, Limit: ${limit}.`);
    }

    return true;
  }
}
