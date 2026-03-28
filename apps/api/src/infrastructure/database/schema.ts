import { pgEnum, pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';

export const tenantSegmentEnum = pgEnum('tenant_segment', [
  'CHURCH',
  'CLINIC',
  'BUSINESS',
  'NGO',
]);

export const whatsappStatusEnum = pgEnum('whatsapp_status', [
  'CONNECTED',
  'DISCONNECTED',
]);

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  segment: tenantSegmentEnum('segment').notNull(),
  status: text('status').notNull().default('active'),
  config: jsonb('config').$type<Record<string, any>>().default({}),
  maxLeads: integer('max_leads').notNull().default(100),
  maxMessagesMonth: integer('max_messages_month').notNull().default(500),
  aiTokensLimit: integer('ai_tokens_limit').notNull().default(50000),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const withTenant = {
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
};

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  ...withTenant,
});

export const leads = pgTable('leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  website: text('website'),
  phone: text('phone'),
  segment: tenantSegmentEnum('segment').notNull(),
  performanceScore: integer('performance_score'),
  aiAnalysis: text('ai_analysis'),
  lastContactAt: timestamp('last_contact_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ...withTenant,
});

export const whatsappInstances = pgTable('whatsapp_instances', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  status: whatsappStatusEnum('status').notNull().default('DISCONNECTED'),
  sessionData: jsonb('session_data').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ...withTenant,
});

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ...withTenant,
});
