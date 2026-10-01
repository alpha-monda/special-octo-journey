// Shape of a customer's answering-agent settings. Shared by the admin form,
// the future /setup wizard, and the server-side prompt builder.

export const OBJECTIVES = [
  { id: 'faqs', label: 'Answer common questions' },
  { id: 'book', label: 'Book appointments' },
  { id: 'messages', label: 'Take messages' },
  { id: 'qualify', label: 'Qualify new leads' },
  { id: 'urgent', label: 'Spot and route urgent calls' },
] as const

export type ObjectiveId = (typeof OBJECTIVES)[number]['id']

export const DEFAULT_FIELDS = ['Caller name', 'Callback phone number', 'Reason for the call']

export type Faq = { question: string; answer: string }

export type AgentSettings = {
  businessName: string
  businessType: string
  hours: string
  timezone: string
  serviceArea: string
  website: string
  objectives: ObjectiveId[]
  objectivesNotes: string
  urgentInstructions: string
  faqs: Faq[]
  bookingLink: string
  fieldsToCollect: string[]
  greeting: string
  tone: string
  voiceId: string
}

export const emptySettings = (): AgentSettings => ({
  businessName: '',
  businessType: '',
  hours: '',
  timezone: 'America/Chicago',
  serviceArea: '',
  website: '',
  objectives: ['faqs', 'messages'],
  objectivesNotes: '',
  urgentInstructions: '',
  faqs: [],
  bookingLink: '',
  fieldsToCollect: [...DEFAULT_FIELDS],
  greeting: '',
  tone: 'Warm and friendly',
  voiceId: '',
})

const LIMITS = { short: 120, medium: 400, long: 2000 } as const

function str(value: unknown, max: number) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : ''
}

// Normalizes untrusted input into a valid AgentSettings, throwing on missing essentials.
export function parseSettings(input: unknown): AgentSettings {
  const raw = (input ?? {}) as Record<string, unknown>
  const validObjectives = new Set<string>(OBJECTIVES.map((o) => o.id))
  const settings: AgentSettings = {
    businessName: str(raw.businessName, LIMITS.short),
    businessType: str(raw.businessType, LIMITS.short),
    hours: str(raw.hours, LIMITS.medium),
    timezone: str(raw.timezone, 64) || 'America/Chicago',
    serviceArea: str(raw.serviceArea, LIMITS.medium),
    website: str(raw.website, LIMITS.short),
    objectives: Array.isArray(raw.objectives)
      ? (raw.objectives.filter((o) => typeof o === 'string' && validObjectives.has(o)) as ObjectiveId[])
      : [],
    objectivesNotes: str(raw.objectivesNotes, LIMITS.long),
    urgentInstructions: str(raw.urgentInstructions, LIMITS.medium),
    faqs: Array.isArray(raw.faqs)
      ? raw.faqs
          .map((f) => ({ question: str((f as Faq)?.question, LIMITS.medium), answer: str((f as Faq)?.answer, LIMITS.long) }))
          .filter((f) => f.question && f.answer)
          .slice(0, 50)
      : [],
    bookingLink: str(raw.bookingLink, LIMITS.short),
    fieldsToCollect: Array.isArray(raw.fieldsToCollect)
      ? [...new Set(raw.fieldsToCollect.map((f) => str(f, 80)).filter(Boolean))].slice(0, 15)
      : [...DEFAULT_FIELDS],
    greeting: str(raw.greeting, LIMITS.medium),
    tone: str(raw.tone, LIMITS.short) || 'Warm and friendly',
    voiceId: str(raw.voiceId, 120),
  }
  if (!settings.businessName || !settings.businessType) throw new Error('Business name and type are required.')
  if (!settings.voiceId) throw new Error('Pick a voice.')
  if (!settings.fieldsToCollect.length) settings.fieldsToCollect = [...DEFAULT_FIELDS]
  return settings
}
