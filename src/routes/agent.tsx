import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Loader2, Mic, PhoneCall, PhoneOff, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RetellWebClient } from 'retell-client-js-sdk'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { Turnstile, type TurnstileHandle } from '@/components/Turnstile'

export const Route = createFileRoute('/agent')({
  head: () => ({
    meta: [
      { title: 'Talk to your AI agent | AI AGENCY XYZ' },
      { name: 'description', content: 'Describe your business and talk to an AI answering agent built for it, right in your browser.' },
    ],
  }),
  component: AgentPage,
})

type CallState = 'idle' | 'starting' | 'live' | 'ended'

type DemoForm = {
  businessName: string
  businessType: string
  objectives: string
  fieldsToCollect: string
  tone: string
}

const emptyForm: DemoForm = { businessName: '', businessType: '', objectives: '', fieldsToCollect: '', tone: '' }

const toneOptions = ['Warm and friendly', 'Calm and professional', 'Upbeat and energetic', 'Direct and efficient']

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function AgentPage() {
  const [form, setForm] = useState<DemoForm>(emptyForm)
  const [callState, setCallState] = useState<CallState>('idle')
  const [error, setError] = useState('')
  const [agentTalking, setAgentTalking] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(Date.now())
  const clientRef = useRef<RetellWebClient | null>(null)
  const turnstileRef = useRef<TurnstileHandle>(null)

  useEffect(() => {
    if (callState !== 'live') return
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [callState])

  useEffect(() => () => clientRef.current?.stopCall(), [])

  const update = (key: keyof DemoForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  async function startCall(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (!turnstileToken) {
      setError('Please complete the human check below the form.')
      return
    }
    setCallState('starting')

    try {
      // Ask for the mic first so a denied prompt doesn't burn a demo slot.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())

      const res = await fetch('/api/demo/web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'We could not start the demo call.')

      const { RetellWebClient } = await import('retell-client-js-sdk')
      const client = new RetellWebClient()
      clientRef.current = client
      client.on('call_started', () => {
        setDeadline(Date.now() + data.maxDurationMs)
        setNow(Date.now())
        setCallState('live')
      })
      client.on('agent_start_talking', () => setAgentTalking(true))
      client.on('agent_stop_talking', () => setAgentTalking(false))
      client.on('call_ended', () => {
        setAgentTalking(false)
        setCallState('ended')
      })
      client.on('error', (message: unknown) => {
        console.error('Retell web call error', message)
        client.stopCall()
        setError('The call dropped. Please try again.')
        setCallState('ended')
      })

      await client.startCall({
        accessToken: data.accessToken,
        callId: data.callId,
        transport: data.transport,
        iceServers: data.iceServers,
      })
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'NotFoundError')
      setError(denied ? 'We need microphone access so you can talk to the agent. Please allow it and try again.' : err instanceof Error ? err.message : 'Something went wrong.')
      setCallState('idle')
    } finally {
      // Turnstile tokens are single-use.
      setTurnstileToken('')
      turnstileRef.current?.reset()
    }
  }

  function endCall() {
    clientRef.current?.stopCall()
    setAgentTalking(false)
    setCallState('ended')
  }

  const inCall = callState === 'starting' || callState === 'live'
  const remaining = deadline - now

  return (
    <div className="page-shell cream-page">
      <SiteHeader />
      <main>
        <section className="subpage-hero agent-hero">
          <p className="eyebrow"><Sparkles size={15} /> Live demo · no phone needed</p>
          <h1>Talk to <i>your</i> agent.</h1>
          <p>Tell us a little about your business. We'll spin up an AI answering agent built for it, and you can talk to it right here in your browser.</p>
        </section>

        <section className="agent-demo">
          <form className="agent-form" onSubmit={startCall}>
            <div className="agent-form-head">
              <span>01</span>
              <h2>Describe your business</h2>
            </div>
            <label>
              <span>Business name</span>
              <input required maxLength={80} value={form.businessName} onChange={update('businessName')} placeholder="Bright Smile Dental" disabled={inCall} />
            </label>
            <label>
              <span>Business type</span>
              <input required maxLength={80} value={form.businessType} onChange={update('businessType')} placeholder="Family dental practice" disabled={inCall} />
            </label>
            <label>
              <span>What should it do?</span>
              <textarea required maxLength={600} rows={3} value={form.objectives} onChange={update('objectives')} placeholder="Answer questions about hours and insurance, book cleanings, and flag dental emergencies." disabled={inCall} />
            </label>
            <label>
              <span>What info should it collect?</span>
              <textarea required maxLength={400} rows={2} value={form.fieldsToCollect} onChange={update('fieldsToCollect')} placeholder="Name, phone number, reason for the call, preferred appointment time" disabled={inCall} />
            </label>
            <label>
              <span>Tone <em>(optional)</em></span>
              <select value={form.tone} onChange={update('tone')} disabled={inCall}>
                <option value="">Pick a tone…</option>
                {toneOptions.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
              </select>
            </label>

            <div className="agent-form-foot">
              <Turnstile ref={turnstileRef} onToken={setTurnstileToken} />
              {callState === 'idle' || callState === 'ended' ? (
                <button type="submit" className="button button-dark">
                  <Mic size={17} /> {callState === 'ended' ? 'Talk to it again' : 'Talk to it'}
                </button>
              ) : null}
              <p className="agent-fine-print"><ShieldCheck size={14} /> Demo calls last up to 3 minutes and are recorded so we can improve the demo.</p>
            </div>
          </form>

          <aside className={`agent-call-panel is-${callState}`} aria-live="polite">
            <div className="call-stack-head"><span>{form.businessName || 'Your business'}</span><span>AI receptionist</span></div>
            <div className="agent-call-stage">
              <div className={`agent-call-orb ${agentTalking ? 'talking' : ''}`}>
                <div className="orb-core">{callState === 'starting' ? <Loader2 className="spin" /> : <PhoneCall />}</div>
                {callState === 'live' && (
                  <div className="sound-bars" aria-hidden="true">
                    {Array.from({ length: 7 }, (_, i) => <span key={i} />)}
                  </div>
                )}
              </div>
              <strong className="agent-call-status">
                {callState === 'idle' && 'Ready when you are'}
                {callState === 'starting' && 'Connecting…'}
                {callState === 'live' && (agentTalking ? 'Agent is speaking' : 'Listening…')}
                {callState === 'ended' && 'Call ended'}
              </strong>
              {callState === 'live' && <span className="agent-call-clock">{formatClock(remaining)} left</span>}
              {callState === 'idle' && <p>Fill in the form, then hit <b>Talk to it</b>. Your browser will ask to use your microphone.</p>}
              {callState === 'ended' && !error && <p>Like what you heard? Pick a plan and we'll build the real one, with its own phone number.</p>}
              {error && <p className="agent-error" role="alert">{error}</p>}
              {inCall && (
                <button type="button" className="button agent-hangup" onClick={endCall}>
                  <PhoneOff size={17} /> End call
                </button>
              )}
              {callState === 'ended' && (
                <Link to="/pricing" className="button button-dark">Set up my agent <ArrowRight size={17} /></Link>
              )}
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
