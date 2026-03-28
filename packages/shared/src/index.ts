import { z } from 'zod';

/**
 * Shared Enums
 */
export enum TenantSegment {
  EDUCATION = 'education',
  HEALTHCARE = 'healthcare',
  REAL_ESTATE = 'real_estate',
  RETAIL = 'retail',
  TECHNOLOGY = 'technology',
  OTHER = 'other'
}

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost'
}

/**
 * Zod Validation Schemas
 * These schemas provide both validation and type inference.
 */

// Tenant Schema
export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(255),
  slug: z.string().min(2).max(100),
  segment: z.nativeEnum(TenantSegment),
  status: z.nativeEnum(TenantStatus),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

// Profile Schema (linked to a user/auth)
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  avatarUrl: z.string().url().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

// Lead Schema
export const LeadSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  profileId: z.string().uuid().optional(), // Lead owner/assigned to
  status: z.nativeEnum(LeadStatus),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
});

/**
 * TypeScript Interfaces inferred from Zod Schemas
 * Use 'z.infer' to maintain a single source of truth for validation and typing.
 */
export interface ITenant extends z.infer<typeof TenantSchema> {}
export interface IProfile extends z.infer<typeof ProfileSchema> {}
export interface ILead extends z.infer<typeof LeadSchema> {}

// Export Zod types for reuse in Create/Update operations
export const CreateTenantSchema = TenantSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateTenantSchema = CreateTenantSchema.partial();

export const CreateProfileSchema = ProfileSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateProfileSchema = CreateProfileSchema.partial();

export const CreateLeadSchema = LeadSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateLeadSchema = CreateLeadSchema.partial();
