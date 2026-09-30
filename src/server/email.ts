import nodemailer from 'nodemailer'

// Outgoing email. Two ways to send, picked by which env vars are set:
// - SMTP (e.g. the Hostinger mailbox hello@aiagencyxyz.com): SMTP_USER + SMTP_PASSWORD,
//   optionally SMTP_HOST / SMTP_PORT (default smtp.hostinger.com:465).
// - Resend's HTTP API: RESEND_API_KEY. Until aiagencyxyz.com is verified in Resend,
//   the default sender onboarding@resend.dev only delivers to the account owner.

export type OutgoingEmail = {
  to: string[]
  subject: string
  html: string
  text: string
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)
}

async function sendViaSmtp(email: OutgoingEmail, user: string, pass: string) {
  const port = Number(process.env.SMTP_PORT) || 465
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port,
    secure: port === 465,
    auth: { user, pass },
  })
  await transport.sendMail({ from: process.env.EMAIL_FROM || `AI AGENCY XYZ <${user}>`, ...email })
}

async function sendViaResend(email: OutgoingEmail, apiKey: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || 'AI AGENCY XYZ <onboarding@resend.dev>', ...email }),
  })
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
  }
}

export async function sendEmail(email: OutgoingEmail) {
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  if (smtpUser && smtpPassword) return sendViaSmtp(email, smtpUser, smtpPassword)

  const resendKey = process.env.RESEND_API_KEY
  if (resendKey) return sendViaResend(email, resendKey)

  throw new Error('No email sender configured: set SMTP_USER + SMTP_PASSWORD, or RESEND_API_KEY')
}
