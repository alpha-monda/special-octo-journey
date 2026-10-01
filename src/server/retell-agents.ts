import Retell from 'retell-sdk'
import type { AgentSettings } from '../lib/agent-settings.js'
import { buildAnalysisFields, buildBeginMessage, buildGeneralPrompt } from './agent-prompt.js'

// Retell provisioning for customer agents. One Retell LLM + one agent + one
// phone number per customer. Server-only: the Retell key never reaches the browser.

export function retellClient() {
  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) throw new Error('RETELL_API_KEY is not set')
  return new Retell({ apiKey })
}

function webhookUrl() {
  const site = process.env.URL || 'https://aiagencyxyz.com'
  return `${site.replace(/\/$/, '')}/api/retell/webhook`
}

function llmParams(s: AgentSettings) {
  return {
    general_prompt: buildGeneralPrompt(s),
    begin_message: buildBeginMessage(s),
    start_speaker: 'agent' as const,
    general_tools: [{ type: 'end_call' as const, name: 'end_call', description: 'End the call once the caller is done and you have recapped the details.' }],
  }
}

function agentParams(s: AgentSettings) {
  return {
    agent_name: `XYZ – ${s.businessName}`.slice(0, 100),
    voice_id: s.voiceId,
    webhook_url: webhookUrl(),
    webhook_events: ['call_ended' as const, 'call_analyzed' as const],
    post_call_analysis_data: buildAnalysisFields(s),
    end_call_after_silence_ms: 30_000,
    max_call_duration_ms: 15 * 60 * 1000,
    timezone: s.timezone || undefined,
  }
}

// Bind to the agent's latest version so settings edits reach live callers immediately.
const inboundAgent = (agentId: string) => [{ agent_id: agentId, weight: 1, agent_version: 'latest' }]

export type ProvisionResult = { llmId: string; agentId: string; phoneNumber: string }

export class ProvisionError extends Error {
  constructor(
    message: string,
    readonly step: 'llm' | 'agent' | 'number',
    readonly cause?: unknown,
  ) {
    super(message)
  }
}

// Creates LLM → agent → number. If any step fails, deletes whatever was created
// so a retry starts clean and nothing keeps billing.
export async function provisionAgent(s: AgentSettings, opts: { areaCode?: number; nickname: string }): Promise<ProvisionResult> {
  const retell = retellClient()
  const created: { llmId?: string; agentId?: string } = {}
  let step: ProvisionError['step'] = 'llm'
  try {
    const llm = await retell.llm.create(llmParams(s))
    created.llmId = llm.llm_id

    step = 'agent'
    const agent = await retell.agent.create({ ...agentParams(s), response_engine: { type: 'retell-llm', llm_id: llm.llm_id } })
    created.agentId = agent.agent_id

    step = 'number'
    const number = await retell.phoneNumber.create({
      ...(opts.areaCode ? { area_code: opts.areaCode } : {}),
      country_code: 'US',
      nickname: opts.nickname.slice(0, 100),
      inbound_agents: inboundAgent(agent.agent_id),
    })

    return { llmId: llm.llm_id, agentId: agent.agent_id, phoneNumber: number.phone_number }
  } catch (error) {
    if (created.agentId) await retell.agent.delete(created.agentId).catch((e) => console.error('rollback: agent delete failed', created.agentId, e))
    if (created.llmId) await retell.llm.delete(created.llmId).catch((e) => console.error('rollback: llm delete failed', created.llmId, e))
    const detail = error instanceof Error ? error.message : String(error)
    const friendly =
      step === 'number' && /area code|available|inventory/i.test(detail)
        ? 'No phone numbers are available in that area code. Try a nearby one.'
        : `Retell failed while creating the ${step === 'llm' ? 'agent brain' : step}: ${detail}`
    throw new ProvisionError(friendly, step, error)
  }
}

// Undoes a successful provisionAgent (e.g. if saving the result failed) so
// nothing is left billing without a customer attached.
export async function releaseProvisioned(result: ProvisionResult) {
  const retell = retellClient()
  await retell.phoneNumber.delete(result.phoneNumber).catch((e) => console.error('release: number delete failed', result.phoneNumber, e))
  await retell.agent.delete(result.agentId).catch((e) => console.error('release: agent delete failed', result.agentId, e))
  await retell.llm.delete(result.llmId).catch((e) => console.error('release: llm delete failed', result.llmId, e))
}

// Settings edits update the existing LLM + agent in place (no new agent or number).
export async function updateAgent(s: AgentSettings, ids: { llmId: string; agentId: string }) {
  const retell = retellClient()
  await retell.llm.update(ids.llmId, llmParams(s))
  await retell.agent.update(ids.agentId, agentParams(s))
}

export async function setNumberActive(phoneNumber: string, agentId: string | null) {
  await retellClient().phoneNumber.update(phoneNumber, { inbound_agents: agentId ? inboundAgent(agentId) : [] })
}

export async function listVoices() {
  const voices = await retellClient().voice.list()
  return voices
    .map((v) => ({ id: v.voice_id, name: v.voice_name, gender: v.gender, accent: v.accent ?? '', provider: v.provider, preview: v.preview_audio_url ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
