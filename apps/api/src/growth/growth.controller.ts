import { Controller, Post, Param, NotFoundException, Logger, BadRequestException, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DRIZZLE } from '../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';
import { TenantContext } from '../infrastructure/database/tenant-context.service';
import { WhatsappService } from '../modules/messaging/whatsapp.service';
import { Quota } from '../modules/quota/quota.guard';
import { UsageTrackerService } from '../modules/quota/usage-tracker.service';

@Controller('growth')
export class GrowthController {
  private readonly logger = new Logger(GrowthController.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly tenantContext: TenantContext,
    private readonly whatsappService: WhatsappService,
    private readonly usageTracker: UsageTrackerService,
  ) {}

  @Post('send-pitch/:leadId')
  @Quota('messages')
  async sendPitch(@Param('leadId') leadId: string) {
    const tenantId = this.tenantContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required to send pitch');
    }

    // Recover lead with multi-tenant isolation
    const [lead] = await this.db
      .select()
      .from(schema.leads)
      .where(
        and(
          eq(schema.leads.id, leadId),
          eq(schema.leads.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found for this tenant`);
    }

    if (!lead.aiAnalysis) {
      throw new BadRequestException(`Lead ${leadId} has no AI analysis yet. Run analysis first.`);
    }

    let analysis;
    try {
      analysis = JSON.parse(lead.aiAnalysis);
    } catch (e) {
      throw new BadRequestException('Invalid AI analysis data stored for this lead');
    }

    const salesPitch = analysis.sales_pitch;
    if (!salesPitch) {
      throw new BadRequestException('No sales pitch found in AI analysis');
    }

    if (!lead.phone) {
      throw new BadRequestException(`Lead ${leadId} has no phone number associated.`);
    }

    this.logger.log(`Initiating pitch delivery for lead: ${lead.name} via WhatsApp`);

    // Dispatch message via WhatsappService (Async via BullMQ)
    await this.whatsappService.enqueueMessage(
      tenantId,
      lead.id,
      lead.phone,
      salesPitch
    );

    // Increment usage counter
    await this.usageTracker.incrementUsage(tenantId, 'messages');

    return {
      message: 'Pitch queued for delivery',
      leadId: lead.id,
      status: 'QUEUED',
    };
  }
}
