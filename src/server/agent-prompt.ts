import { OBJECTIVES, type AgentSettings } from '../lib/agent-settings.js'

// Turns a customer's settings into the Retell LLM prompt, greeting, and the
// post-call analysis fields (what to extract from every call).

const RECORDING_DISCLOSURE = 'this call may be recorded'

export function buildBeginMessage(s: AgentSettings) {
  const greeting = s.greeting || `Thanks for calling ${s.businessName}! How can I help you today?`
  // The recording disclosure is mandatory and can't be removed by the customer.
  if (greeting.toLowerCase().includes('recorded')) return greeting
  const sentences = greeting.match(/^(.*?[.!?])\s+(.*)$/)
  return sentences
    ? `${sentences[1]} Just so you know, ${RECORDING_DISCLOSURE}. ${sentences[2]}`
    : `${greeting} Just so you know, ${RECORDING_DISCLOSURE}.`
}

export function buildGeneralPrompt(s: AgentSettings) {
  const objectiveLabels = OBJECTIVES.filter((o) => s.objectives.includes(o.id)).map((o) => `- ${o.label}`)
  const lines: string[] = [
    '## Identity',
    `You are the AI phone receptionist for ${s.businessName}, a ${s.businessType}.`,
    `Speak in a ${s.tone.toLowerCase()} way. You are on a live phone call: keep every reply short`,
    '(one or two sentences), natural, and conversational. Never use lists, markdown, or emojis,',
    'and never read out long URLs character by character.',
    '',
    '## Business details',
  ]
  if (s.hours) lines.push(`Hours: ${s.hours}${s.timezone ? ` (${s.timezone})` : ''}`)
  if (s.serviceArea) lines.push(`Service area: ${s.serviceArea}`)
  if (s.website) lines.push(`Website: ${s.website}`)
  if (!s.hours && !s.serviceArea && !s.website) lines.push('No extra details were provided.')

  lines.push('', '## What you do on calls', ...(objectiveLabels.length ? objectiveLabels : ['- Take messages']))
  if (s.objectivesNotes) lines.push('', s.objectivesNotes)

  if (s.objectives.includes('book')) {
    lines.push(
      '',
      '## Booking appointments',
      s.bookingLink
        ? `You can't see the calendar. Collect the caller's preferred day and time, and tell them they can also book online at ${s.businessName}'s booking page, which will be in the follow-up. Never promise a specific slot is available.`
        : "You can't see the calendar. Collect the caller's preferred day and time and say the team will confirm. Never promise a specific slot is available.",
    )
  }
  if (s.objectives.includes('urgent') || s.urgentInstructions) {
    lines.push(
      '',
      '## Urgent calls',
      s.urgentInstructions || 'If the call sounds urgent, collect their details first and tell them the team will be alerted right away.',
      'If someone describes a life-threatening emergency, tell them to hang up and call 911 immediately.',
    )
  }

  if (s.faqs.length) {
    lines.push('', '## Answers to common questions', 'Use these answers. Rephrase naturally; do not read them word for word.')
    for (const f of s.faqs) lines.push(`Q: ${f.question}`, `A: ${f.answer}`)
  }

  lines.push(
    '',
    '## Information to collect',
    'Before the call ends, collect the following, one item at a time, in a natural way:',
    ...s.fieldsToCollect.map((f) => `- ${f}`),
    'Confirm phone numbers and the spelling of names back to the caller.',
    '',
    '## Rules',
    "- Only state facts that are in this prompt. If you don't know something (prices, availability, policies), say you'll have the team follow up, and take a message.",
    '- Never give medical, legal, or financial advice.',
    '- If asked whether you are an AI, say yes, you are an AI receptionist for ' + s.businessName + '.',
    "- When you have what you need, briefly recap the details, tell the caller someone will follow up, thank them, and end the call.",
  )
  return lines.join('\n')
}

function slug(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 40) || 'field'
  )
}

// Post-call analysis: one extracted value per "what to collect" field, plus the
// signals the self-improvement loop uses.
export function buildAnalysisFields(s: AgentSettings) {
  const seen = new Set<string>()
  const collected = s.fieldsToCollect.map((label) => {
    let name = slug(label)
    while (seen.has(name)) name = `${name}_2`
    seen.add(name)
    return { type: 'string' as const, name, description: `The caller's ${label.toLowerCase()}, if they provided it. Empty if not provided.` }
  })
  return [
    { type: 'system-presets' as const, name: 'call_summary' as const },
    { type: 'system-presets' as const, name: 'user_sentiment' as const },
    ...collected,
    {
      type: 'string' as const,
      name: 'unanswered_questions',
      description: 'Questions the caller asked that the agent could not answer from what it knew. Empty if none.',
    },
    {
      type: 'boolean' as const,
      name: 'is_urgent',
      description: 'True if the caller described something urgent or time-sensitive that the business should act on right away.',
    },
  ]
}

export function analysisFieldLabels(s: AgentSettings) {
  return buildAnalysisFields(s)
    .filter((f) => f.type === 'string' && f.name !== 'unanswered_questions')
    .map((f, i) => ({ name: f.name, label: s.fieldsToCollect[i] }))
}
