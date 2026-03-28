import { z } from 'zod';

export const AIAnalysisResponseSchema = z.object({
  tech_stack: z.array(z.string()),
  vulnerabilities: z.array(z.string()),
  sales_pitch: z.string(),
  score: z.number().min(0).max(10),
});

export type AIAnalysisResponseDto = z.infer<typeof AIAnalysisResponseSchema>;
