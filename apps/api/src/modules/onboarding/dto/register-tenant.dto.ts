import { z } from 'zod';

export const RegisterTenantSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  segment: z.enum(['CHURCH', 'CLINIC', 'BUSINESS', 'NGO']),
});

export type RegisterTenantDto = z.infer<typeof RegisterTenantSchema>;
