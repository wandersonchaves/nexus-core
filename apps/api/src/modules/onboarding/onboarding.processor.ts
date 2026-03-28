import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';

@Processor('events')
export class OnboardingProcessor extends WorkerHost {
  private readonly logger = new Logger(OnboardingProcessor.name);

  constructor(@Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'tenant.created') {
      const { tenantId, name, segment } = job.data;

      this.logger.log(`Processing onboarding for tenant ${tenantId} (${name})`);

      try {
        // 1. Initialize default config based on segment
        const defaultConfig = {
          features: ['leads', 'whatsapp', 'ai_analysis'],
          max_leads: segment === 'BUSINESS' ? 1000 : 500,
          theme: 'light',
          onboarding_completed: false,
        };

        await this.db
          .update(schema.tenants)
          .set({ config: defaultConfig })
          .where(eq(schema.tenants.id, tenantId));

        // 2. Prepare initial WhatsApp instance
        await this.db.insert(schema.whatsappInstances).values({
          name: 'Primary Device',
          tenantId: tenantId,
          status: 'DISCONNECTED',
        });

        // 3. Simulate Welcome Email (SES Emulator)
        this.logger.log(`[SES EMULATOR] Sending welcome email to admin of ${name}...`);
        this.logger.log(`Welcome to NexusCore, ${name}! Your workspace is ready.`);

        this.logger.log(`Onboarding process completed for tenant ${tenantId}`);
      } catch (error) {
        this.logger.error(`Failed to process onboarding for tenant ${tenantId}: ${error.message}`);
        throw error;
      }
    }
  }
}
