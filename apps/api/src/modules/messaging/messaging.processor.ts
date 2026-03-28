import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq } from 'drizzle-orm';
import type { IMessagingProvider } from '../../core/messaging/interfaces';

@Processor('messaging')
export class MessagingProcessor extends WorkerHost {
  private readonly logger = new Logger(MessagingProcessor.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    @Inject('IMessagingProvider') private readonly messagingProvider: IMessagingProvider,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'send-whatsapp') {
      const { leadId, phone, message, sessionData } = job.data;

      this.logger.log(`Processing message for lead ${leadId} to ${phone}`);

      try {
        // Send message via provider
        await this.messagingProvider.sendMessage(phone, message, sessionData);

        // Update last_contact_at in leads
        await this.db
          .update(schema.leads)
          .set({
            lastContactAt: new Date(),
          })
          .where(eq(schema.leads.id, leadId));

        this.logger.log(`Successfully sent message and updated lastContactAt for lead ${leadId}`);
      } catch (error) {
        this.logger.error(`Failed to send message for lead ${leadId}: ${error.message}`);
        throw error; // Let BullMQ handle the retry
      }
    }
  }
}
