import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { demoCallAttempts } from '../../db/schema.js'
import { escapeHtml, sendEmail } from './email.js'

// The subset of Retell's call object (call_analyzed webhook) this report uses.
export type RetellCall = {
  call_id: string
  agent_id?: string
  call_type?: string
  duration_ms?: number
  start_timestamp?: number
  disconnection_reason?: string
  transcript?: string
  retell_llm_dynamic_variables?: Record<string, string>
  call_analysis?: { call_summary?: string; user_sentiment?: string }
}

function formatDuration(ms?: number) {
  if (!ms) return 'unknown'
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}m ${total % 60}s`
}

// Emails the demo call's summary and transcript to DEMO_NOTIFY_EMAIL.
// Idempotent per call: Retell retries failed webhooks, so a call that was
// already emailed is skipped.
export async function reportDemoCall(call: RetellCall) {
  const [attempt] = await db.select().from(demoCallAttempts).where(eq(demoCallAttempts.retellCallId, call.call_id)).limit(1)
  if (attempt?.emailedAt) return

  const summary = call.call_analysis?.call_summary?.trim() || '(Retell did not return a summary for this call.)'
  const transcript = call.transcript?.trim() || '(No transcript. The visitor may not have spoken.)'
  const durationSec = call.duration_ms ? Math.round(call.duration_ms / 1000) : null

  if (attempt) {
    await db.update(demoCallAttempts).set({ summary, transcript, durationSec }).where(eq(demoCallAttempts.id, attempt.id))
  }

  const to = (process.env.DEMO_NOTIFY_EMAIL ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  if (!to.length) {
    console.warn('DEMO_NOTIFY_EMAIL is not set; skipping demo call email', call.call_id)
    return
  }

  const vars = call.retell_llm_dynamic_variables ?? {}
  const details: [string, string][] = [
    ['Business', vars.business_name ?? '(not provided)'],
    ['Type', vars.business_type ?? '(not provided)'],
    ['What it should do', vars.objectives ?? '(not provided)'],
    ['Info to collect', vars.fields_to_collect ?? '(not provided)'],
    ['Tone', vars.tone ?? '(default)'],
    ['Length', formatDuration(call.duration_ms)],
    ['Ended because', call.disconnection_reason ?? 'unknown'],
    ['Caller sentiment', call.call_analysis?.user_sentiment ?? 'unknown'],
    ['Started', call.start_timestamp ? new Date(call.start_timestamp).toUTCString() : 'unknown'],
    ['Retell call ID', call.call_id],
  ]

  const html = `
<div style="font-family:Arial,sans-serif;color:#171713;max-width:640px">
  <h2 style="margin:0 0 4px">New "Talk to it" demo call</h2>
  <p style="margin:0 0 20px;color:#69675f">${escapeHtml(vars.business_name ?? 'A visitor')} tried the demo on aiagencyxyz.com.</p>
  <h3 style="margin:0 0 6px">Summary</h3>
  <p style="margin:0 0 20px;line-height:1.5">${escapeHtml(summary)}</p>
  <table style="border-collapse:collapse;width:100%;margin-bottom:20px;font-size:14px">
    ${details.map(([k, v]) => `<tr><td style="padding:6px 10px 6px 0;color:#69675f;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`).join('')}
  </table>
  <h3 style="margin:0 0 6px">Transcript</h3>
  <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;font-size:14px;line-height:1.5;background:#f4efe5;padding:14px;margin:0">${escapeHtml(transcript)}</pre>
</div>`

  const text = [
    'New "Talk to it" demo call',
    '',
    'SUMMARY',
    summary,
    '',
    ...details.map(([k, v]) => `${k}: ${v}`),
    '',
    'TRANSCRIPT',
    transcript,
  ].join('\n')

  await sendEmail({ to, subject: `Demo call: ${vars.business_name ?? 'website visitor'} (${formatDuration(call.duration_ms)})`, html, text })

  if (attempt) {
    await db.update(demoCallAttempts).set({ emailedAt: new Date() }).where(eq(demoCallAttempts.id, attempt.id))
  }
}
