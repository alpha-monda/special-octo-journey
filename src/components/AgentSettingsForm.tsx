import { Play, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { DEFAULT_FIELDS, OBJECTIVES, type AgentSettings, type ObjectiveId } from '@/lib/agent-settings'

export type Voice = { id: string; name: string; gender: string; accent: string; provider: string; preview: string }

const TONES = ['Warm and friendly', 'Calm and professional', 'Upbeat and energetic', 'Direct and efficient']
const TIMEZONES = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu']

// Edits a customer's agent settings. Used by the admin "new customer" and
// "edit agent" screens; the self-serve /setup wizard will reuse the same sections.
export function AgentSettingsForm({ value, onChange, voices }: { value: AgentSettings; onChange: (next: AgentSettings) => void; voices: Voice[] }) {
  const set = <K extends keyof AgentSettings>(key: K, v: AgentSettings[K]) => onChange({ ...value, [key]: v })
  const text = (key: keyof AgentSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(key, e.target.value as never)
  const [newField, setNewField] = useState('')
  const audio = useRef<HTMLAudioElement | null>(null)

  const toggleObjective = (id: ObjectiveId) =>
    set('objectives', value.objectives.includes(id) ? value.objectives.filter((o) => o !== id) : [...value.objectives, id])

  const playVoice = () => {
    const voice = voices.find((v) => v.id === value.voiceId)
    if (!voice?.preview) return
    audio.current?.pause()
    audio.current = new Audio(voice.preview)
    void audio.current.play()
  }

  return (
    <div className="admin-form-sections">
      <fieldset>
        <legend>1 · Business</legend>
        <div className="admin-grid">
          <label><span>Business name *</span><input required value={value.businessName} onChange={text('businessName')} /></label>
          <label><span>Business type *</span><input required value={value.businessType} onChange={text('businessType')} placeholder="Family dental practice" /></label>
          <label><span>Hours</span><input value={value.hours} onChange={text('hours')} placeholder="Mon–Fri 8am–5pm, closed weekends" /></label>
          <label>
            <span>Timezone</span>
            <select value={value.timezone} onChange={text('timezone')}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz.replace('America/', '').replace('_', ' ')}</option>)}
            </select>
          </label>
          <label><span>Service area</span><input value={value.serviceArea} onChange={text('serviceArea')} placeholder="Austin and surrounding suburbs" /></label>
          <label><span>Website</span><input value={value.website} onChange={text('website')} placeholder="example.com" /></label>
        </div>
      </fieldset>

      <fieldset>
        <legend>2 · What it does</legend>
        <div className="admin-checks">
          {OBJECTIVES.map((o) => (
            <label key={o.id} className="admin-check">
              <input type="checkbox" checked={value.objectives.includes(o.id)} onChange={() => toggleObjective(o.id)} />
              {o.label}
            </label>
          ))}
        </div>
        <label><span>Anything else it should do or know</span><textarea rows={3} value={value.objectivesNotes} onChange={text('objectivesNotes')} /></label>
        {value.objectives.includes('book') && (
          <label><span>Booking link</span><input value={value.bookingLink} onChange={text('bookingLink')} placeholder="https://calendly.com/…" /></label>
        )}
        {value.objectives.includes('urgent') && (
          <label><span>What counts as urgent, and what to tell those callers</span><textarea rows={2} value={value.urgentInstructions} onChange={text('urgentInstructions')} placeholder="Water leaks and no-heat calls are urgent. Tell them a technician will call back within 30 minutes." /></label>
        )}
        <div className="admin-faqs">
          <span className="admin-label">FAQs</span>
          {value.faqs.map((faq, i) => (
            <div key={i} className="admin-faq">
              <input value={faq.question} placeholder="Question" onChange={(e) => set('faqs', value.faqs.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)))} />
              <textarea rows={2} value={faq.answer} placeholder="Answer" onChange={(e) => set('faqs', value.faqs.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f)))} />
              <button type="button" className="admin-icon-button" aria-label="Remove FAQ" onClick={() => set('faqs', value.faqs.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" className="button button-small button-light" onClick={() => set('faqs', [...value.faqs, { question: '', answer: '' }])}><Plus size={15} /> Add FAQ</button>
        </div>
      </fieldset>

      <fieldset>
        <legend>3 · What to collect</legend>
        <div className="admin-chips">
          {value.fieldsToCollect.map((f) => (
            <span key={f} className="admin-chip">
              {f}
              <button type="button" aria-label={`Remove ${f}`} onClick={() => set('fieldsToCollect', value.fieldsToCollect.filter((x) => x !== f))}>×</button>
            </span>
          ))}
        </div>
        <div className="admin-inline">
          <input value={newField} placeholder="Add a field, e.g. Insurance provider" onChange={(e) => setNewField(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newField.trim()) { set('fieldsToCollect', [...value.fieldsToCollect, newField.trim()]); setNewField('') } } }} />
          <button type="button" className="button button-small button-light" onClick={() => { if (newField.trim()) { set('fieldsToCollect', [...value.fieldsToCollect, newField.trim()]); setNewField('') } }}>Add</button>
          <button type="button" className="text-link" onClick={() => set('fieldsToCollect', [...new Set([...DEFAULT_FIELDS, ...value.fieldsToCollect])])}>Restore defaults</button>
        </div>
      </fieldset>

      <fieldset>
        <legend>4 · Greeting, tone and voice</legend>
        <label>
          <span>First thing it says</span>
          <input value={value.greeting} onChange={text('greeting')} placeholder={`Thanks for calling ${value.businessName || 'us'}! How can I help you today?`} />
          <small>"Just so you know, this call may be recorded." is always added. It can't be removed.</small>
        </label>
        <div className="admin-grid">
          <label>
            <span>Tone</span>
            <select value={value.tone} onChange={text('tone')}>
              {[...new Set([value.tone, ...TONES])].map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            <span>Voice *</span>
            <div className="admin-inline">
              <select required value={value.voiceId} onChange={text('voiceId')}>
                <option value="">Pick a voice…</option>
                {voices.map((v) => <option key={v.id} value={v.id}>{v.name} · {v.gender}{v.accent ? ` · ${v.accent}` : ''} ({v.provider})</option>)}
              </select>
              <button type="button" className="admin-icon-button" aria-label="Play voice preview" onClick={playVoice} disabled={!value.voiceId}><Play size={16} /></button>
            </div>
          </label>
        </div>
      </fieldset>
    </div>
  )
}
