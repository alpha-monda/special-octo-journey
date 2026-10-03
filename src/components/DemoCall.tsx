import { PhoneOff } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { RetellWebClient } from 'retell-client-js-sdk'
import { Turnstile, type TurnstileHandle } from '@/components/Turnstile'

// The "Talk to it" demo form on /agents: chips → POST /api/demo/web-call →
// Retell web call in the browser (Phase 1).

const TYPES = ['Plumbing', 'HVAC', 'Salon', 'Dental', 'Law', 'Other']
const DOES = ['Answer questions', 'Book appointments', 'Take messages', 'Qualify leads']
const COLLECTS = ['Name', 'Phone', 'Email', 'Address', 'Reason for call']

type CallState = 'idle' | 'starting' | 'live' | 'ended'

function ChipGroup({ legend, options, selected, onToggle, disabled }: { legend: string; options: string[]; selected: string[]; onToggle: (o: string) => void; disabled: boolean }) {
  return (
    <fieldset>
      <legend className="flabel">{legend}</legend>
      <div className="chips">
        {options.map((o) => (
          <button key={o} type="button" className="chip-btn" aria-pressed={selected.includes(o)} disabled={disabled} onClick={() => onToggle(o)}>
            {o}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function DemoCall() {
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [type, setType] = useState('Plumbing')
  const [does, setDoes] = useState(['Answer questions', 'Book appointments'])
  const [collects, setCollects] = useState(['Name', 'Phone', 'Reason for call'])
  const [callState, setCallState] = useState<CallState>('idle')
  const [agentTalking, setAgentTalking] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(Date.now())
  const client = useRef<RetellWebClient | null>(null)
  const turnstile = useRef<TurnstileHandle>(null)

  useEffect(() => {
    if (callState !== 'live') return
    const t = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(t)
  }, [callState])
  useEffect(() => () => client.current?.stopCall(), [])

  const toggle = (list: string[], set: (v: string[]) => void) => (o: string) => set(list.includes(o) ? list.filter((x) => x !== o) : [...list, o])
  const inCall = callState === 'starting' || callState === 'live'

  async function start(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!business.trim()) return setError('Add your business name first.')
    if (!does.length) return setError('Pick at least one thing it should do.')
    if (!collects.length) return setError('Pick at least one thing to ask callers for.')
    if (!token) return setError('Please complete the quick human check below.')
    setCallState('starting')
    try {
      // Ask for the mic first so a denied prompt doesn't use up a demo.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((t) => t.stop())
      const res = await fetch('/api/demo/web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorName: name,
          businessName: business,
          businessType: type === 'Other' ? 'local business' : type,
          objectives: does.join(', '),
          fieldsToCollect: collects.join(', '),
          turnstileToken: token,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'We could not start the demo call.')

      const { RetellWebClient } = await import('retell-client-js-sdk')
      const c = new RetellWebClient()
      client.current = c
      c.on('call_started', () => {
        setDeadline(Date.now() + data.maxDurationMs)
        setNow(Date.now())
        setCallState('live')
      })
      c.on('agent_start_talking', () => setAgentTalking(true))
      c.on('agent_stop_talking', () => setAgentTalking(false))
      c.on('call_ended', () => {
        setAgentTalking(false)
        setCallState('ended')
      })
      c.on('error', (msg: unknown) => {
        console.error('Retell web call error', msg)
        c.stopCall()
        setError('The call dropped. Please try again.')
        setCallState('ended')
      })
      await c.startCall({ accessToken: data.accessToken, callId: data.callId, transport: data.transport, iceServers: data.iceServers })
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'NotFoundError')
      setError(denied ? 'We need your microphone so you can talk to it. Allow it and try again.' : err instanceof Error ? err.message : 'Something went wrong.')
      setCallState('idle')
    } finally {
      setToken('')
      turnstile.current?.reset()
    }
  }

  function end() {
    client.current?.stopCall()
    setAgentTalking(false)
    setCallState('ended')
  }

  return (
    <form className="quilt dk demo-form" aria-label="Build your demo agent" onSubmit={start}>
      <div className="two-col">
        <div className="bigfield">
          <label htmlFor="d-you">Your name</label>
          <input id="d-you" name="name" type="text" autoComplete="given-name" enterKeyHint="next" placeholder="Alex" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} disabled={inCall} />
        </div>
        <div className="bigfield">
          <label htmlFor="d-biz">Business name</label>
          <input id="d-biz" name="organization" type="text" autoComplete="organization" enterKeyHint="done" placeholder="Rivera Plumbing" maxLength={80} required value={business} onChange={(e) => setBusiness(e.target.value)} disabled={inCall} />
        </div>
      </div>
      <ChipGroup legend="What kind of business?" options={TYPES} selected={[type]} onToggle={setType} disabled={inCall} />
      <ChipGroup legend="It should…" options={DOES} selected={does} onToggle={toggle(does, setDoes)} disabled={inCall} />
      <ChipGroup legend="Ask callers for…" options={COLLECTS} selected={collects} onToggle={toggle(collects, setCollects)} disabled={inCall} />

      {error && <p className="demo-error" role="alert">{error}</p>}

      <div aria-live="polite">
        {inCall ? (
          <div className="demo-status">
            <span className={`talk-dot ${agentTalking ? 'on' : ''}`} aria-hidden="true" />
            <strong>{callState === 'starting' ? 'Connecting…' : agentTalking ? 'Your agent is talking' : 'Listening…'}</strong>
            {callState === 'live' && <span className="clock">{formatClock(deadline - now)} left</span>}
            <button type="button" className="puff white sm" onClick={end}><PhoneOff size={18} /> End call</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
            <Turnstile ref={turnstile} onToken={setToken} />
            <button type="submit" className="pill">{callState === 'ended' ? 'Talk to it again' : 'Talk to it'}</button>
            {callState === 'ended' && !error && <p className="demo-note">Like what you heard? Pick a plan below and we'll set up the real one.</p>}
            <p className="demo-note">Demo calls are recorded so we can improve them.</p>
          </div>
        )}
      </div>
    </form>
  )
}
