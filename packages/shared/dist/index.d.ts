import { z } from 'zod';
/**
 * Shared Enums
 */
export declare enum TenantSegment {
    EDUCATION = "education",
    HEALTHCARE = "healthcare",
    REAL_ESTATE = "real_estate",
    RETAIL = "retail",
    TECHNOLOGY = "technology",
    OTHER = "other"
}
export declare enum TenantStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    TRIAL = "trial"
}
export declare enum LeadStatus {
    NEW = "new",
    CONTACTED = "contacted",
    QUALIFIED = "qualified",
    PROPOSAL = "proposal",
    NEGOTIATION = "negotiation",
    CLOSED_WON = "closed_won",
    CLOSED_LOST = "closed_lost"
}
/**
 * Zod Validation Schemas
 * These schemas provide both validation and type inference.
 */
export declare const TenantSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    segment: z.ZodEnum<typeof TenantSegment>;
    status: z.ZodEnum<typeof TenantStatus>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const ProfileSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export declare const LeadSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    profileId: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<typeof LeadStatus>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    createdAt: z.ZodDate;
    updatedAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
/**
 * TypeScript Interfaces inferred from Zod Schemas
 * Use 'z.infer' to maintain a single source of truth for validation and typing.
 */
export interface ITenant extends z.infer<typeof TenantSchema> {
}
export interface IProfile extends z.infer<typeof ProfileSchema> {
}
export interface ILead extends z.infer<typeof LeadSchema> {
}
export declare const CreateTenantSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    segment: z.ZodEnum<typeof TenantSegment>;
    status: z.ZodEnum<typeof TenantStatus>;
}, z.core.$strip>;
export declare const UpdateTenantSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    segment: z.ZodOptional<z.ZodEnum<typeof TenantSegment>>;
    status: z.ZodOptional<z.ZodEnum<typeof TenantStatus>>;
}, z.core.$strip>;
export declare const CreateProfileSchema: z.ZodObject<{
    tenantId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    avatarUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const UpdateProfileSchema: z.ZodObject<{
    tenantId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    avatarUrl: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
}, z.core.$strip>;
export declare const CreateLeadSchema: z.ZodObject<{
    status: z.ZodEnum<typeof LeadStatus>;
    tenantId: z.ZodString;
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    profileId: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$strip>;
export declare const UpdateLeadSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<typeof LeadStatus>>;
    tenantId: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    profileId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    company: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    metadata: z.ZodOptional<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map