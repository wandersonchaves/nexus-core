import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    @InjectQueue('messaging') private readonly messagingQueue: Queue,
  ) {}

  async enqueueMessage(tenantId: string, leadId: string, phone: string, message: string) {
    if (!phone) {
      throw new BadRequestException('Lead phone number is required to send messages');
    }

    // Recover first active WhatsApp instance for this tenant
    const [instance] = await this.db
      .select()
      .from(schema.whatsappInstances)
      .where(
        and(
          eq(schema.whatsappInstances.tenantId, tenantId),
          eq(schema.whatsappInstances.status, 'CONNECTED')
        )
      )
      .limit(1);

    if (!instance) {
      throw new BadRequestException('No connected WhatsApp instance found for this tenant');
    }

    this.logger.log(`Enqueuing message to lead ${leadId} via instance ${instance.id}`);

    // Add job to BullMQ
    await this.messagingQueue.add('send-whatsapp', {
      tenantId,
      leadId,
      instanceId: instance.id,
      phone,
      message,
      sessionData: instance.sessionData,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
  }
}
