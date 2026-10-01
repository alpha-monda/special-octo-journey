import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

// A paying customer (business). status: pending_setup | live | paused | canceled
export const organizations = pgTable('organizations', {
  id: serial().primaryKey(),
  name: text().notNull(),
  plan: text().notNull().default('solo'),
  timezone: text().notNull().default('America/Chicago'),
  status: text().notNull().default('pending_setup'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  notifyEmails: jsonb('notify_emails').$type<string[]>().notNull().default([]),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const assistants = pgTable('assistants', {
  id: serial().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  retellAgentId: text('retell_agent_id').unique(),
  retellLlmId: text('retell_llm_id'),
  name: text().notNull(),
  phoneNumber: text('phone_number'),
  areaCode: integer('area_code'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const callRecords = pgTable('call_records', {
  id: serial().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  assistantId: integer('assistant_id').references(() => assistants.id),
  retellCallId: text('retell_call_id').unique(),
  callerNumber: text('caller_number'),
  direction: text().notNull().default('inbound'),
  intent: text(),
  outcome: text(),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  transcript: text(),
  summary: text(),
  sentiment: text(),
  humanReviewStatus: text('human_review_status').notNull().default('not_required'),
  metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  deliveryStatus: jsonb('delivery_status').$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp('started_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const integrations = pgTable('integrations', {
  id: serial().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  provider: text().notNull(),
  status: text().notNull().default('disconnected'),
  externalAccountId: text('external_account_id'),
  settings: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// One row per accepted "Talk to it" demo request. Used for per-IP and global
// rate limits (the IP is stored only as a salted SHA-256 hash) and to record
// the call summary once Retell's call_analyzed webhook arrives.
export const demoCallAttempts = pgTable(
  'demo_call_attempts',
  {
    id: serial().primaryKey(),
    ipHash: text('ip_hash').notNull(),
    retellCallId: text('retell_call_id'),
    businessType: text('business_type'),
    durationSec: integer('duration_sec'),
    summary: text(),
    transcript: text(),
    emailedAt: timestamp('emailed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('demo_call_attempts_ip_created_idx').on(table.ipHash, table.createdAt)],
)

// Append-only history of a customer's agent settings. The highest version is
// what's live; restoring an old version appends a copy as a new version.
export const agentSettingsVersions = pgTable(
  'agent_settings_versions',
  {
    id: serial().primaryKey(),
    organizationId: integer('organization_id').notNull().references(() => organizations.id),
    version: integer().notNull(),
    settings: jsonb().$type<Record<string, unknown>>().notNull(),
    note: text(),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('agent_settings_versions_org_version_idx').on(table.organizationId, table.version)],
)
