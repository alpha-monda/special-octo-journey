import { and, desc, eq, max } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { agentSettingsVersions, assistants, callRecords, organizations } from '../../db/schema.js'
import type { AgentSettings } from '../lib/agent-settings.js'
import { ProvisionError, provisionAgent, releaseProvisioned, setNumberActive, updateAgent } from './retell-agents.js'

export type CustomerInput = {
  contactName: string
  contactEmail: string
  plan: string
  notifyEmails: string[]
}

const PLANS = new Set(['solo', 'assisted', 'growth', 'office'])
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseCustomer(raw: Record<string, unknown>): CustomerInput {
  const notifyEmails = (Array.isArray(raw.notifyEmails) ? raw.notifyEmails : String(raw.notifyEmails ?? '').split(/[,\s]+/))
    .map((e) => String(e).trim().toLowerCase())
    .filter(Boolean)
  const bad = notifyEmails.find((e) => !EMAIL.test(e))
  if (bad) throw new Error(`"${bad}" is not a valid email address.`)
  if (!notifyEmails.length) throw new Error('Add at least one email for call summaries.')
  const plan = String(raw.plan ?? 'solo')
  return {
    contactName: String(raw.contactName ?? '').trim().slice(0, 120),
    contactEmail: String(raw.contactEmail ?? '').trim().toLowerCase().slice(0, 200),
    plan: PLANS.has(plan) ? plan : 'solo',
    notifyEmails: [...new Set(notifyEmails)].slice(0, 10),
  }
}

async function latestVersion(orgId: number) {
  const [row] = await db
    .select()
    .from(agentSettingsVersions)
    .where(eq(agentSettingsVersions.organizationId, orgId))
    .orderBy(desc(agentSettingsVersions.version))
    .limit(1)
  return row
}

async function appendVersion(orgId: number, settings: AgentSettings, note: string) {
  const [{ current }] = await db
    .select({ current: max(agentSettingsVersions.version) })
    .from(agentSettingsVersions)
    .where(eq(agentSettingsVersions.organizationId, orgId))
  const version = (current ?? 0) + 1
  await db.insert(agentSettingsVersions).values({ organizationId: orgId, version, settings, note, createdBy: 'admin' })
  return version
}

export async function getAssistant(orgId: number) {
  const [row] = await db.select().from(assistants).where(eq(assistants.organizationId, orgId)).limit(1)
  return row
}

// Creates the customer + settings v1, then provisions in Retell. A provisioning
// failure leaves the customer in pending_setup so it can be retried.
export async function createCustomer(customer: CustomerInput, settings: AgentSettings, areaCode?: number) {
  const [org] = await db
    .insert(organizations)
    .values({ name: settings.businessName, plan: customer.plan, timezone: settings.timezone, contactName: customer.contactName, contactEmail: customer.contactEmail, notifyEmails: customer.notifyEmails })
    .returning({ id: organizations.id })
  await appendVersion(org.id, settings, 'Initial setup')
  await db.insert(assistants).values({ organizationId: org.id, name: settings.businessName, areaCode: areaCode ?? null, isActive: false })
  const provision = await provisionCustomer(org.id)
  return { id: org.id, ...provision }
}

export async function provisionCustomer(orgId: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const assistant = await getAssistant(orgId)
  const current = await latestVersion(orgId)
  if (!assistant || !current) return { ok: false, error: 'Customer not found.' }
  if (assistant.retellAgentId) return { ok: true }
  const settings = current.settings as AgentSettings
  try {
    const result = await provisionAgent(settings, { areaCode: assistant.areaCode ?? undefined, nickname: `${settings.businessName} (#${orgId})` })
    try {
      await db
        .update(assistants)
        .set({ retellAgentId: result.agentId, retellLlmId: result.llmId, phoneNumber: result.phoneNumber, isActive: true })
        .where(eq(assistants.id, assistant.id))
    } catch (error) {
      await releaseProvisioned(result)
      throw error
    }
    await db.update(organizations).set({ status: 'live', updatedAt: new Date() }).where(eq(organizations.id, orgId))
    return { ok: true }
  } catch (error) {
    console.error('provisioning failed', orgId, error)
    return { ok: false, error: error instanceof ProvisionError ? error.message : 'Provisioning failed. Please try again.' }
  }
}

// Pushes to Retell first, then records the version, so the history only ever
// contains settings that actually went live.
export async function saveSettings(orgId: number, settings: AgentSettings, note: string) {
  const assistant = await getAssistant(orgId)
  if (!assistant) throw new Error('Customer not found.')
  if (assistant.retellAgentId && assistant.retellLlmId) {
    await updateAgent(settings, { llmId: assistant.retellLlmId, agentId: assistant.retellAgentId })
  }
  await db.update(organizations).set({ name: settings.businessName, timezone: settings.timezone, updatedAt: new Date() }).where(eq(organizations.id, orgId))
  return appendVersion(orgId, settings, note)
}

export async function restoreVersion(orgId: number, version: number) {
  const [row] = await db
    .select()
    .from(agentSettingsVersions)
    .where(and(eq(agentSettingsVersions.organizationId, orgId), eq(agentSettingsVersions.version, version)))
    .limit(1)
  if (!row) throw new Error('Version not found.')
  return saveSettings(orgId, row.settings as AgentSettings, `Restored version ${version}`)
}

export async function setPaused(orgId: number, paused: boolean) {
  const assistant = await getAssistant(orgId)
  if (!assistant?.phoneNumber || !assistant.retellAgentId) throw new Error('This customer has no live number yet.')
  await setNumberActive(assistant.phoneNumber, paused ? null : assistant.retellAgentId)
  await db.update(assistants).set({ isActive: !paused }).where(eq(assistants.id, assistant.id))
  await db.update(organizations).set({ status: paused ? 'paused' : 'live', updatedAt: new Date() }).where(eq(organizations.id, orgId))
}

export async function updateContact(orgId: number, customer: CustomerInput) {
  await db
    .update(organizations)
    .set({ plan: customer.plan, contactName: customer.contactName, contactEmail: customer.contactEmail, notifyEmails: customer.notifyEmails, updatedAt: new Date() })
    .where(eq(organizations.id, orgId))
}

export async function listCustomers() {
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      plan: organizations.plan,
      status: organizations.status,
      phoneNumber: assistants.phoneNumber,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .leftJoin(assistants, eq(assistants.organizationId, organizations.id))
    .orderBy(desc(organizations.createdAt))
}

export async function getCustomer(orgId: number) {
  const [org] = await db.select().from(organizations).where(eq(organizations.id, orgId)).limit(1)
  if (!org) return null
  const assistant = await getAssistant(orgId)
  const versions = await db
    .select({ version: agentSettingsVersions.version, note: agentSettingsVersions.note, createdAt: agentSettingsVersions.createdAt, settings: agentSettingsVersions.settings })
    .from(agentSettingsVersions)
    .where(eq(agentSettingsVersions.organizationId, orgId))
    .orderBy(desc(agentSettingsVersions.version))
    .limit(30)
  const calls = await db
    .select({
      id: callRecords.id,
      callerNumber: callRecords.callerNumber,
      startedAt: callRecords.startedAt,
      durationSeconds: callRecords.durationSeconds,
      summary: callRecords.summary,
      sentiment: callRecords.sentiment,
      metadata: callRecords.metadata,
      deliveryStatus: callRecords.deliveryStatus,
      transcript: callRecords.transcript,
    })
    .from(callRecords)
    .where(eq(callRecords.organizationId, orgId))
    .orderBy(desc(callRecords.startedAt))
    .limit(25)
  return {
    org,
    assistant: assistant ?? null,
    settings: (versions[0]?.settings ?? null) as AgentSettings | null,
    versions: versions.map(({ settings: _s, ...v }) => v),
    // Flatten JSON columns to plain strings so they serialize cleanly to the browser.
    calls: calls.map(({ metadata, deliveryStatus, ...call }) => {
      const collected = ((metadata as { collected?: Record<string, unknown> }).collected ?? {}) as Record<string, unknown>
      return {
        ...call,
        collected: Object.fromEntries(Object.entries(collected).map(([k, v]) => [k, v == null ? '' : String(v)])) as Record<string, string>,
        emailStatus: String((deliveryStatus as { email?: unknown }).email ?? 'pending'),
      }
    }),
  }
}
