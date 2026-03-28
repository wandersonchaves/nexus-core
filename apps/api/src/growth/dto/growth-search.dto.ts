import { z } from 'zod';

export const GrowthSearchSchema = z.object({
  term: z.string().min(3),
  location: z.string().optional(),
  depth: z.number().int().min(1).max(5).default(1),
});

export type GrowthSearchDto = z.infer<typeof GrowthSearchSchema>;
