// Transactional email via Resend's HTTP API (https://resend.com/docs/api-reference/emails/send-email).
// Until aiagencyxyz.com is verified in Resend, the default sender
// onboarding@resend.dev can only deliver to the Resend account owner's address.
const DEFAULT_FROM = 'AI AGENCY XYZ <onboarding@resend.dev>'

export type OutgoingEmail = {
  to: string[]
  subject: string
  html: string
  text: string
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)
}

export async function sendEmail(email: OutgoingEmail) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || DEFAULT_FROM, ...email }),
  })
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
  }
}
