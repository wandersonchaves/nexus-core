import { Module } from '@nestjs/common';
import { ScrapingService } from './application/scraping.service';
import { LeadAnalyzerService } from './application/lead-analyzer.service';
import { MockScraper, SqsJobProducer, OpenAiProvider } from './infrastructure/growth-implementations';
import { DatabaseModule } from '../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    ScrapingService,
    LeadAnalyzerService,
    {
      provide: 'IScraper',
      useClass: MockScraper,
    },
    {
      provide: 'IJobProducer',
      useClass: SqsJobProducer,
    },
    {
      provide: 'ILLMProvider',
      useClass: OpenAiProvider,
    },
  ],
  exports: [ScrapingService, LeadAnalyzerService],
})
export class GrowthModule {}
