import { Injectable, Inject, Logger, BadRequestException, ConflictException } from '@nestjs/common';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    @InjectQueue('events') private readonly eventsQueue: Queue,
  ) {}

  async register(dto: RegisterTenantDto) {
    const { name, slug, segment } = dto;

    // 1. Check if slug already exists
    const [existing] = await this.db
      .select()
      .from(schema.tenants)
      .where(eq(schema.tenants.slug, slug))
      .limit(1);

    if (existing) {
      throw new ConflictException(`Slug ${slug} is already taken`);
    }

    this.logger.log(`Provisioning new tenant: ${name} (${slug})`);

    try {
      // 2. Atomic Transaction: Tenant + Role
      const result = await this.db.transaction(async (tx) => {
        const [tenant] = await tx.insert(schema.tenants).values({
          name,
          slug,
          segment,
          status: 'active',
          config: {}, // Initially empty, will be populated by worker
        }).returning();

        // Create initial Admin role
        await tx.insert(schema.roles).values({
          name: 'Admin',
          tenantId: tenant.id,
          permissions: ['*'], // Super user
        });

        return tenant;
      });

      this.logger.log(`Tenant ${result.id} successfully provisioned.`);

      // 3. Dispatch "tenant.created" event (Simulating SQS via BullMQ)
      await this.eventsQueue.add('tenant.created', {
        tenantId: result.id,
        name: result.name,
        slug: result.slug,
        segment: result.segment,
      });

      return {
        id: result.id,
        name: result.name,
        slug: result.slug,
        message: 'Tenant successfully registered. Check your email for next steps.',
      };
    } catch (error) {
      this.logger.error(`Error provisioning tenant: ${error.message}`);
      throw error;
    }
  }
}
