import { Injectable, Inject, Logger } from '@nestjs/common';
import { IScraper, IJobProducer } from '../domain/interfaces';
import { GrowthSearchDto } from '../dto/growth-search.dto';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { TenantContext } from '../../infrastructure/database/tenant-context.service';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @Inject('IScraper') private readonly scraper: IScraper,
    @Inject('IJobProducer') private readonly jobProducer: IJobProducer,
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly tenantContext: TenantContext,
  ) {}

  async executeScraping(dto: GrowthSearchDto) {
    const tenantId = this.tenantContext.tenantId;

    if (!tenantId) {
      throw new Error('Tenant context is required to execute scraping.');
    }

    this.logger.log(`Starting scraping for tenant ${tenantId} with term: ${dto.term}`);

    // Simulate search
    const results = await this.scraper.search(dto.term, dto.location, dto.depth);

    for (const result of results) {
      // Save lead with tenant_id propagation
      await this.db.insert(schema.leads).values({
        name: result.name,
        website: result.website,
        phone: result.phone,
        segment: result.segment,
        tenantId: tenantId, // Explicit propagation as requested
      });

      // Produce job for AI Analysis/Score
      await this.jobProducer.publishScrapingJob({
        leadName: result.name,
        tenantId: tenantId,
        action: 'AI_ANALYSIS',
      });
    }

    return { count: results.length };
  }
}
