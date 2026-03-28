import { Injectable, Logger } from '@nestjs/common';
import { IScraper, IJobProducer, LeadResult, ILLMProvider } from '../domain/interfaces';

@Injectable()
export class MockScraper implements IScraper {
  async search(term: string, location?: string, depth?: number): Promise<LeadResult[]> {
    // Mocking some results
    return [
      {
        name: `Prospect of ${term} 1`,
        website: 'https://example1.com',
        phone: '+5511999999999',
        segment: 'BUSINESS',
      },
      {
        name: `Prospect of ${term} 2`,
        website: 'https://example2.com',
        phone: '+5511888888888',
        segment: 'CLINIC',
      },
    ];
  }
}

@Injectable()
export class SqsJobProducer implements IJobProducer {
  private readonly logger = new Logger(SqsJobProducer.name);

  async publishScrapingJob(payload: any): Promise<void> {
    this.logger.log(`[SQS EMULATOR] Sending payload to queue: ${JSON.stringify(payload)}`);
    // Emulate sending to AWS SQS
  }
}

@Injectable()
export class OpenAiProvider implements ILLMProvider {
  async generateAnalysis(prompt: string): Promise<any> {
    // Simulate OpenAI API Call
    return {
      tech_stack: ['React', 'Node.js', 'PostgreSQL'],
      vulnerabilities: ['Outdated SSL', 'Exposed .git'],
      sales_pitch: 'Scale your business with our automated solutions.',
      score: 8,
    };
  }
}
