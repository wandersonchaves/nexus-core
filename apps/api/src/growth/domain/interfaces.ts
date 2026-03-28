export interface LeadResult {
  name: string;
  website?: string;
  phone?: string;
  segment: 'CHURCH' | 'CLINIC' | 'BUSINESS' | 'NGO';
}

export interface IScraper {
  search(term: string, location?: string, depth?: number): Promise<LeadResult[]>;
}

export interface IJobProducer {
  publishScrapingJob(payload: any): Promise<void>;
}

export interface AIAnalysisResponse {
  tech_stack: string[];
  vulnerabilities: string[];
  sales_pitch: string;
  score: number;
}

export interface ILLMProvider {
  generateAnalysis(prompt: string): Promise<AIAnalysisResponse>;
}
