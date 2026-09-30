import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const organizations = pgTable('organizations', {
  id: serial().primaryKey(),
  name: text().notNull(),
  plan: text().notNull().default('solo'),
  timezone: text().notNull().default('America/Chicago'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const assistants = pgTable('assistants', {
  id: serial().primaryKey(),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  retellAgentId: text('retell_agent_id').unique(),
  name: text().notNull(),
  phoneNumber: text('phone_number'),
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
