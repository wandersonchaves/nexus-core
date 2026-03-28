"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeadSchema = exports.CreateLeadSchema = exports.UpdateProfileSchema = exports.CreateProfileSchema = exports.UpdateTenantSchema = exports.CreateTenantSchema = exports.LeadSchema = exports.ProfileSchema = exports.TenantSchema = exports.LeadStatus = exports.TenantStatus = exports.TenantSegment = void 0;
const zod_1 = require("zod");
/**
 * Shared Enums
 */
var TenantSegment;
(function (TenantSegment) {
    TenantSegment["EDUCATION"] = "education";
    TenantSegment["HEALTHCARE"] = "healthcare";
    TenantSegment["REAL_ESTATE"] = "real_estate";
    TenantSegment["RETAIL"] = "retail";
    TenantSegment["TECHNOLOGY"] = "technology";
    TenantSegment["OTHER"] = "other";
})(TenantSegment || (exports.TenantSegment = TenantSegment = {}));
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["INACTIVE"] = "inactive";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["TRIAL"] = "trial";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["QUALIFIED"] = "qualified";
    LeadStatus["PROPOSAL"] = "proposal";
    LeadStatus["NEGOTIATION"] = "negotiation";
    LeadStatus["CLOSED_WON"] = "closed_won";
    LeadStatus["CLOSED_LOST"] = "closed_lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
/**
 * Zod Validation Schemas
 * These schemas provide both validation and type inference.
 */
// Tenant Schema
exports.TenantSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(2).max(255),
    slug: zod_1.z.string().min(2).max(100),
    segment: zod_1.z.nativeEnum(TenantSegment),
    status: zod_1.z.nativeEnum(TenantStatus),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date().optional()
});
// Profile Schema (linked to a user/auth)
exports.ProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    avatarUrl: zod_1.z.string().url().nullable().optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date().optional()
});
// Lead Schema
exports.LeadSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string().uuid(),
    profileId: zod_1.z.string().uuid().optional(), // Lead owner/assigned to
    status: zod_1.z.nativeEnum(LeadStatus),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date().optional()
});
// Export Zod types for reuse in Create/Update operations
exports.CreateTenantSchema = exports.TenantSchema.omit({ id: true, createdAt: true, updatedAt: true });
exports.UpdateTenantSchema = exports.CreateTenantSchema.partial();
exports.CreateProfileSchema = exports.ProfileSchema.omit({ id: true, createdAt: true, updatedAt: true });
exports.UpdateProfileSchema = exports.CreateProfileSchema.partial();
exports.CreateLeadSchema = exports.LeadSchema.omit({ id: true, createdAt: true, updatedAt: true });
exports.UpdateLeadSchema = exports.CreateLeadSchema.partial();
//# sourceMappingURL=index.js.map