import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { assistants, callRecords, organizations } from '../../db/schema.js'
import type { AgentSettings } from '../lib/agent-settings.js'
import { analysisFieldLabels } from './agent-prompt.js'
import type { RetellCall } from './demo-call-report.js'
import { escapeHtml, sendEmail } from './email.js'
import { getCustomer } from './customers.server.js'

type CustomerCall = RetellCall & {
  from_number?: string
  call_analysis?: RetellCall['call_analysis'] & { custom_analysis_data?: Record<string, unknown> }
}

export async function findAssistantByAgentId(agentId: string) {
  const [row] = await db.select().from(assistants).where(eq(assistants.retellAgentId, agentId)).limit(1)
  return row
}

// Stores (or updates) the call record. Called for both call_ended and
// call_analyzed so a call is never lost even if analysis never arrives.
async function upsertCall(orgId: number, assistantId: number, call: CustomerCall) {
  const analysis = call.call_analysis ?? {}
  const values = {
    organizationId: orgId,
    assistantId,
    retellCallId: call.call_id,
    callerNumber: call.from_number ?? null,
    durationSeconds: call.duration_ms ? Math.round(call.duration_ms / 1000) : 0,
    transcript: call.transcript ?? null,
    summary: analysis.call_summary ?? null,
    sentiment: analysis.user_sentiment ?? null,
    metadata: { collected: analysis.custom_analysis_data ?? {}, disconnectionReason: call.disconnection_reason ?? null },
    startedAt: call.start_timestamp ? new Date(call.start_timestamp) : new Date(),
  }
  const [row] = await db
    .insert(callRecords)
    .values(values)
    .onConflictDoUpdate({
      target: callRecords.retellCallId,
      set: {
        durationSeconds: values.durationSeconds,
        transcript: values.transcript,
        callerNumber: values.callerNumber,
        // Keep analysis fields from call_analyzed if call_ended arrives late.
        ...(call.call_analysis ? { summary: values.summary, sentiment: values.sentiment, metadata: values.metadata } : {}),
      },
    })
    .returning()
  return row
}

export async function handleCustomerCallEvent(event: string, call: CustomerCall) {
  if (!call.agent_id) return
  const assistant = await findAssistantByAgentId(call.agent_id)
  if (!assistant) return
  const record = await upsertCall(assistant.organizationId, assistant.id, call)
  if (event !== 'call_analyzed') return
  if ((record.deliveryStatus as { email?: string }).email === 'sent') return

  const [org] = await db.select().from(organizations).where(eq(organizations.id, assistant.organizationId)).limit(1)
  const detail = await getCustomer(assistant.organizationId)
  const settings = detail?.settings as AgentSettings | null
  if (!org || !org.notifyEmails.length) {
    await db.update(callRecords).set({ deliveryStatus: { email: 'no_recipients' } }).where(eq(callRecords.id, record.id))
    return
  }

  const collected = (call.call_analysis?.custom_analysis_data ?? {}) as Record<string, unknown>
  const labels = settings ? analysisFieldLabels(settings) : []
  const rows: [string, string][] = [
    ['Caller number', call.from_number ?? 'Unknown'],
    ...labels.map(({ name, label }) => [label, String(collected[name] ?? '').trim() || '—'] as [string, string]),
    ['Length', `${Math.floor(record.durationSeconds / 60)}m ${record.durationSeconds % 60}s`],
    ['When', record.startedAt.toLocaleString('en-US', { timeZone: org.timezone || 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' })],
  ]
  const urgent = collected.is_urgent === true
  const unanswered = String(collected.unanswered_questions ?? '').trim()
  const summary = record.summary?.trim() || 'No summary was generated for this call.'
  const transcript = record.transcript?.trim() || 'No transcript (the caller may not have spoken).'

  const html = `
<div style="font-family:Arial,sans-serif;color:#171713;max-width:640px">
  ${urgent ? '<p style="background:#ff5a1f;color:#fff;padding:8px 12px;font-weight:bold;margin:0 0 16px">URGENT: the caller described something time-sensitive.</p>' : ''}
  <h2 style="margin:0 0 4px">New call for ${escapeHtml(org.name)}</h2>
  <p style="margin:0 0 20px;color:#69675f">Answered by your AI receptionist.</p>
  <h3 style="margin:0 0 6px">Summary</h3>
  <p style="margin:0 0 20px;line-height:1.5">${escapeHtml(summary)}</p>
  <table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:14px">
    ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px 6px 0;color:#69675f;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`).join('')}
  </table>
  ${unanswered ? `<p style="background:#f4efe5;padding:10px 12px;margin:0 0 20px"><b>Your agent couldn't answer:</b> ${escapeHtml(unanswered)}<br><span style="color:#69675f">Reply to this email with the answer and we'll teach your agent.</span></p>` : ''}
  <h3 style="margin:0 0 6px">Transcript</h3>
  <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;background:#f4efe5;padding:14px;margin:0">${escapeHtml(transcript)}</pre>
</div>`
  const text = [
    urgent ? 'URGENT: the caller described something time-sensitive.\n' : '',
    `New call for ${org.name}`,
    '',
    'SUMMARY',
    summary,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    unanswered ? `\nYour agent couldn't answer: ${unanswered}\n(Reply with the answer and we'll teach your agent.)` : '',
    '',
    'TRANSCRIPT',
    transcript,
  ].join('\n')

  try {
    await sendEmail({
      to: org.notifyEmails,
      subject: `${urgent ? '[URGENT] ' : ''}New call from ${call.from_number ?? 'unknown caller'}`,
      html,
      text,
    })
    await db.update(callRecords).set({ deliveryStatus: { email: 'sent', sentAt: new Date().toISOString() } }).where(eq(callRecords.id, record.id))
  } catch (error) {
    await db.update(callRecords).set({ deliveryStatus: { email: 'failed', error: String(error).slice(0, 300) } }).where(eq(callRecords.id, record.id))
    throw error
  }
}
