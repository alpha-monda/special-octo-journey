import { createFileRoute } from '@tanstack/react-router'
import { OBJECTIVES, emptySettings, parseSettings } from '@/lib/agent-settings'
import { isAdmin } from '@/server/admin-auth'
import { ProvisionError, createLlmAndAgent, retellClient } from '@/server/retell-agents'

// POST /api/provision — admin only. Builds a prompt from the business details,
// creates a Retell LLM and agent, and returns the agent ID. No phone number, no
// database row (the admin "New customer" flow does both). An empty body uses
// SAMPLE so the flow can be tested end to end.

const SAMPLE = {
  businessName: 'Rivera Plumbing',
  businessType: 'Plumber',
  objectives: ['faqs', 'messages', 'urgent'],
  fieldsToCollect: ['Caller name', 'Callback phone number', 'Address', 'What needs fixing'],
}

const OBJECTIVE_IDS = new Set<string>(OBJECTIVES.map((o) => o.id))
const list = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : typeof v === 'string' ? v.split(',') : []

export const Route = createFileRoute('/api/provision')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { 'Cache-Control': 'no-store' }
        if (!isAdmin()) return Response.json({ error: 'Sign in at /admin first' }, { status: 401, headers })

        const raw = await request.json().catch(() => ({}))
        const body = (raw && typeof raw === 'object' && Object.keys(raw).length ? raw : SAMPLE) as Record<string, unknown>

        // Objectives may be known ids (faqs, book, messages, qualify, urgent) or free text.
        const objectives = list(body.objectives).map((o) => o.trim()).filter(Boolean)
        if (typeof body.businessName !== 'string' || !body.businessName.trim() || typeof body.businessType !== 'string' || !body.businessType.trim()) {
          return Response.json({ error: 'Business name and type are required.' }, { status: 400, headers })
        }
        try {
          let voiceId = typeof body.voiceId === 'string' ? body.voiceId : ''
          if (!voiceId) {
            const voices = await retellClient().voice.list()
            voiceId = voices[0]?.voice_id ?? ''
          }
          const settings = parseSettings({
            ...emptySettings(),
            businessName: body.businessName,
            businessType: body.businessType,
            objectives: objectives.filter((o) => OBJECTIVE_IDS.has(o)),
            objectivesNotes: objectives.filter((o) => !OBJECTIVE_IDS.has(o)).join('\n'),
            fieldsToCollect: list(body.fieldsToCollect).map((f) => f.trim()).filter(Boolean),
            voiceId,
          })
          const { agentId, llmId } = await createLlmAndAgent(settings)
          return Response.json({ agentId, llmId, sample: body === SAMPLE }, { headers })
        } catch (error) {
          if (error instanceof ProvisionError) return Response.json({ error: error.message }, { status: 502, headers })
          const message = error instanceof Error ? error.message : 'Provisioning failed'
          console.error('provision failed', error)
          return Response.json({ error: message }, { status: 400, headers })
        }
      },
    },
  },
})
