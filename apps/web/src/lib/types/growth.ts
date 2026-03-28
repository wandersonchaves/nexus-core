export type LeadStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';

export interface Lead {
  id: string;
  name: string;
  website: string;
  aiScore: number | null;
  status: LeadStatus;
  createdAt: string;
}

export interface AnalyzeLeadResponse {
  jobId: string;
  message: string;
}
