import { and, count, eq, gt, sql } from 'drizzle-orm'
import Retell from 'retell-sdk'
import { db } from '../../db/index.js'
import { demoCallAttempts } from '../../db/schema.js'

// Demo calls are hard-capped by Retell itself, not just by the browser timer.
export const DEMO_MAX_CALL_MS = 3 * 60 * 1000

const PER_IP_HOURLY_LIMIT = 3
const PER_IP_DAILY_LIMIT = 6
const DEFAULT_GLOBAL_DAILY_LIMIT = 150

const FIELD_LIMITS = {
  visitorName: 60,
  businessName: 80,
  businessType: 80,
  objectives: 600,
  fieldsToCollect: 400,
  tone: 80,
} as const

export type DemoCallInput = {
  visitorName: string
  businessName: string
  businessType: string
  objectives: string
  fieldsToCollect: string
  tone: string
}

export class DemoCallError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
  }
}

// Collapse whitespace and strip control characters so visitor text can't
// break out of the prompt's formatting or smuggle in odd bytes.
function clean(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

export function parseDemoInput(body: Record<string, unknown>): DemoCallInput {
  const input = {
    visitorName: clean(body.visitorName, FIELD_LIMITS.visitorName),
    businessName: clean(body.businessName, FIELD_LIMITS.businessName),
    businessType: clean(body.businessType, FIELD_LIMITS.businessType),
    objectives: clean(body.objectives, FIELD_LIMITS.objectives),
    fieldsToCollect: clean(body.fieldsToCollect, FIELD_LIMITS.fieldsToCollect),
    tone: clean(body.tone, FIELD_LIMITS.tone),
  }
  if (!input.businessName || !input.businessType || !input.objectives || !input.fieldsToCollect) {
    throw new DemoCallError('Please fill in your business name, type, what it should do, and what to collect.', 400)
  }
  return input
}

export function clientIp(request: Request) {
  return (
    request.headers.get('x-nf-client-connection-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

async function hashIp(ip: string) {
  const salt = process.env.DEMO_IP_SALT ?? 'aiagencyxyz-demo'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyTurnstile(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) throw new DemoCallError('The demo is not configured yet.', 503)
  if (typeof token !== 'string' || !token) {
    throw new DemoCallError('Please complete the human check first.', 400)
  }

  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip !== 'unknown') form.append('remoteip', ip)

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    console.error('turnstile siteverify failed', res.status)
    throw new DemoCallError('We could not run the human check. Please try again in a minute.', 503)
  }
  const result = (await res.json()) as { success?: boolean }
  if (!result.success) {
    throw new DemoCallError('The human check expired or failed. Please try again.', 403)
  }
}

// Records the attempt only if the visitor is under every limit. Attempts are
// counted before the Retell call so failed or abandoned calls still count.
export async function reserveDemoSlot(ip: string, businessType: string) {
  const ipHash = await hashIp(ip)
  const hourAgo = sql`now() - interval '1 hour'`
  const dayAgo = sql`now() - interval '1 day'`

  const [[hourly], [daily], [global]] = await Promise.all([
    db.select({ n: count() }).from(demoCallAttempts).where(and(eq(demoCallAttempts.ipHash, ipHash), gt(demoCallAttempts.createdAt, hourAgo))),
    db.select({ n: count() }).from(demoCallAttempts).where(and(eq(demoCallAttempts.ipHash, ipHash), gt(demoCallAttempts.createdAt, dayAgo))),
    db.select({ n: count() }).from(demoCallAttempts).where(gt(demoCallAttempts.createdAt, dayAgo)),
  ])

  const globalLimit = Number(process.env.DEMO_DAILY_CAP) || DEFAULT_GLOBAL_DAILY_LIMIT
  if (global.n >= globalLimit) {
    throw new DemoCallError('The demo is very busy today. Please try again tomorrow, or email hello@aiagencyxyz.com.', 429)
  }
  if (hourly.n >= PER_IP_HOURLY_LIMIT || daily.n >= PER_IP_DAILY_LIMIT) {
    throw new DemoCallError("You've reached the demo limit for now. Please try again later.", 429)
  }

  const [row] = await db.insert(demoCallAttempts).values({ ipHash, businessType }).returning({ id: demoCallAttempts.id })
  return row.id
}

export async function createDemoWebCall(input: DemoCallInput, attemptId: number) {
  const apiKey = process.env.RETELL_API_KEY
  const agentId = process.env.RETELL_DEMO_AGENT_ID
  if (!apiKey || !agentId) throw new DemoCallError('The demo is not configured yet.', 503)

  const retell = new Retell({ apiKey })
  const call = await retell.call.createWebCall({
    agent_id: agentId,
    retell_llm_dynamic_variables: {
      business_name: input.businessName,
      business_type: input.businessType,
      objectives: input.objectives,
      fields_to_collect: input.fieldsToCollect,
      tone: input.tone || 'warm, friendly, and professional',
      visitor_name: input.visitorName || 'the caller',
    },
    agent_override: {
      agent: {
        max_call_duration_ms: DEMO_MAX_CALL_MS,
        end_call_after_silence_ms: 20_000,
      },
    },
    metadata: { source: 'aiagencyxyz-demo', attempt_id: attemptId },
  })

  await db.update(demoCallAttempts).set({ retellCallId: call.call_id }).where(eq(demoCallAttempts.id, attemptId))

  return {
    accessToken: call.access_token,
    callId: call.call_id,
    transport: call.transport,
    iceServers: call.ice_servers,
    maxDurationMs: DEMO_MAX_CALL_MS,
  }
}
