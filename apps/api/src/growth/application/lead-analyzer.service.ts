import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import type { ILLMProvider } from '../domain/interfaces';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';
import { AIAnalysisResponseSchema } from '../dto/ai-analysis.dto';
import { TenantContext } from '../../infrastructure/database/tenant-context.service';

@Injectable()
export class LeadAnalyzerService {
  private readonly logger = new Logger(LeadAnalyzerService.name);

  constructor(
    @Inject('ILLMProvider') private readonly llmProvider: ILLMProvider,
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly tenantContext: TenantContext,
  ) {}

  async analyze(leadId: string) {
    const tenantId = this.tenantContext.tenantId;

    if (!tenantId) {
      throw new Error('Tenant context is required for analysis');
    }

    // Fetch lead with multi-tenant isolation
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

    // Idempotency check: Don't re-process if already analyzed
    if (lead.aiAnalysis || lead.performanceScore !== null) {
      this.logger.log(`Lead ${leadId} already analyzed. Skipping.`);
      return lead;
    }

    this.logger.log(`Analyzing lead: ${lead.name} (${lead.website})`);

    // Simulate HTML Fetch
    const mockHtml = `<html><body>Welcome to ${lead.name}. We use React and Node.js.</body></html>`;

    // Dynamic Prompt based on Segment
    const segmentStrategy = {
      CHURCH: 'Focus on member management, donations, and community engagement.',
      CLINIC: 'Focus on appointment scheduling, patient records, and privacy (HIPAA).',
      BUSINESS: 'Focus on B2B sales, CRM integration, and operational efficiency.',
      NGO: 'Focus on volunteer management and social impact reporting.',
    };

    const prompt = `
      Analyze the following lead data and website content:
      Lead: ${lead.name}
      Segment: ${lead.segment}
      Strategy: ${segmentStrategy[lead.segment] || segmentStrategy.BUSINESS}
      HTML Context: ${mockHtml}

      Respond ONLY with a valid JSON matching this schema:
      {
        "tech_stack": ["string"],
        "vulnerabilities": ["string"],
        "sales_pitch": "string",
        "score": number (0-10)
      }
    `;

    try {
      const rawAnalysis = await this.llmProvider.generateAnalysis(prompt);
      
      // Strict Validation with Zod
      const validatedAnalysis = AIAnalysisResponseSchema.parse(rawAnalysis);

      // Update Database
      await this.db
        .update(schema.leads)
        .set({
          aiAnalysis: JSON.stringify(validatedAnalysis),
          performanceScore: validatedAnalysis.score,
        })
        .where(eq(schema.leads.id, leadId));

      this.logger.log(`Lead ${leadId} successfully analyzed by AI.`);
      
      return validatedAnalysis;
    } catch (error) {
      this.logger.error(`Error analyzing lead ${leadId}: ${error.message}`);
      throw error;
    }
  }
}
