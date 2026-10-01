import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, History, Loader2, Pause, PhoneCall, Play, RotateCcw, Save } from 'lucide-react'
import { useState } from 'react'
import { AgentSettingsForm } from '@/components/AgentSettingsForm'
import { CustomerFields, type CustomerForm } from '@/components/CustomerFields'
import type { AgentSettings } from '@/lib/agent-settings'
import { formatDuration, formatPhone } from '@/lib/format'
import { getCustomerDetail, getVoices, restoreVersion, retryProvision, saveSettings, setPaused, updateContact } from '@/server/admin.functions'

export const Route = createFileRoute('/admin/customers/$id')({
  validateSearch: (search: Record<string, unknown>): { error?: string } => (typeof search.error === 'string' ? { error: search.error } : {}),
  loader: async ({ params }) => {
    const [detail, voices] = await Promise.all([getCustomerDetail({ data: { id: Number(params.id) } }), getVoices()])
    return { detail, voices }
  },
  component: CustomerPage,
})

function CustomerPage() {
  const { detail, voices } = Route.useLoaderData()
  const { error: provisionError } = Route.useSearch()
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(provisionError ? { kind: 'error', text: provisionError } : null)
  const [settings, setSettings] = useState<AgentSettings | null>(detail?.settings ?? null)
  const [note, setNote] = useState('')
  const [customer, setCustomer] = useState<CustomerForm | null>(
    detail ? { contactName: detail.org.contactName ?? '', contactEmail: detail.org.contactEmail ?? '', plan: detail.org.plan, notifyEmails: detail.org.notifyEmails.join(', ') } : null,
  )

  if (!detail || !settings || !customer) return <p>Customer not found. <Link to="/admin" className="text-link">Back</Link></p>
  const { org, assistant, versions, calls } = detail
  const id = org.id

  const run = async (label: string, action: () => Promise<unknown>, success: string) => {
    setBusy(label)
    setMessage(null)
    try {
      await action()
      await router.invalidate()
      setMessage({ kind: 'ok', text: success })
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setBusy(null)
    }
  }

  const retry = () =>
    run('retry', async () => {
      const result = await retryProvision({ data: { id } })
      if (!result.ok) throw new Error(result.error)
      await router.navigate({ to: '/admin/customers/$id', params: { id: String(id) }, search: {} })
    }, 'Agent created and number connected.')

  return (
    <>
      <Link to="/admin" className="text-link admin-back"><ArrowLeft size={15} /> All customers</Link>
      <div className="admin-title-row">
        <h1>{org.name}</h1>
        <span className={`admin-status status-${org.status}`}>{org.status.replace('_', ' ')}</span>
      </div>
      {message && <p className={message.kind === 'ok' ? 'admin-ok' : 'agent-error'} role="status">{message.text}</p>}

      <section className="admin-card admin-number">
        {assistant?.phoneNumber ? (
          <>
            <div>
              <span className="admin-label">Their AI number</span>
              <strong className="admin-big-number">{formatPhone(assistant.phoneNumber)}</strong>
              <p>Have the customer turn on <b>conditional call forwarding</b> (forward when busy / unanswered) from their business line to this number.</p>
            </div>
            <div className="admin-actions">
              <a className="button button-dark button-small" href={`tel:${assistant.phoneNumber}`}><PhoneCall size={15} /> Call it now</a>
              {org.status === 'paused' ? (
                <button className="button button-light button-small" disabled={!!busy} onClick={() => run('pause', () => setPaused({ data: { id, paused: false } }), 'Agent resumed: calls are being answered again.')}><Play size={15} /> Resume</button>
              ) : (
                <button className="button button-light button-small" disabled={!!busy} onClick={() => run('pause', () => setPaused({ data: { id, paused: true } }), 'Agent paused: the number no longer answers.')}><Pause size={15} /> Pause</button>
              )}
            </div>
          </>
        ) : (
          <div>
            <span className="admin-label">Not live yet</span>
            <p>The agent and phone number haven't been created. Fix the issue above if there is one, then try again.</p>
            <button className="button button-dark button-small" disabled={!!busy} onClick={retry}>{busy === 'retry' ? <Loader2 className="spin" size={15} /> : <PhoneCall size={15} />} Create agent and number</button>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>Customer</h2>
        <CustomerFields value={customer} onChange={setCustomer} />
        <button className="button button-light button-small" disabled={!!busy} onClick={() => run('contact', () => updateContact({ data: { id, customer } }), 'Customer details saved.')}><Save size={15} /> Save customer details</button>
      </section>

      <section className="admin-card">
        <h2>Agent settings <small>· version {versions[0]?.version ?? 1}</small></h2>
        <AgentSettingsForm value={settings} onChange={setSettings} voices={voices} />
        <div className="admin-inline">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="What changed? (optional, shows in history)" />
          <button className="button button-dark button-small" disabled={!!busy} onClick={() => run('save', async () => { await saveSettings({ data: { id, settings, note } }); setNote('') }, assistant?.retellAgentId ? 'Saved. The live agent is updated.' : 'Saved.')}>
            {busy === 'save' ? <Loader2 className="spin" size={15} /> : <Save size={15} />} Save and update agent
          </button>
        </div>
      </section>

      <section className="admin-card">
        <h2><History size={18} /> Version history</h2>
        <ul className="admin-versions">
          {versions.map((v, i) => (
            <li key={v.version}>
              <span><b>v{v.version}</b> · {v.note || 'Settings updated'} · {new Date(v.createdAt).toLocaleString()}</span>
              {i === 0 ? (
                <em>live</em>
              ) : (
                <button className="text-link" disabled={!!busy} onClick={() => run('restore', async () => { await restoreVersion({ data: { id, version: v.version } }) }, `Restored version ${v.version}. Reloading…`).then(() => window.location.reload())}>
                  <RotateCcw size={14} /> Restore
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-card">
        <h2>Recent calls</h2>
        {calls.length === 0 ? (
          <p>No calls yet.</p>
        ) : (
          <div className="admin-calls">
            {calls.map((c) => (
              <details key={c.id} className="admin-call">
                <summary>
                  <span>{new Date(c.startedAt).toLocaleString()}</span>
                  <span>{formatPhone(c.callerNumber)}</span>
                  <span>{formatDuration(c.durationSeconds)}</span>
                  <span className={`admin-status status-email-${c.emailStatus}`}>email {c.emailStatus}</span>
                </summary>
                <p><b>Summary:</b> {c.summary || '—'}</p>
                {Object.entries(c.collected).filter(([, v]) => v).length > 0 && (
                  <ul>{Object.entries(c.collected).filter(([, v]) => v).map(([k, v]) => <li key={k}><b>{k.replace(/_/g, ' ')}:</b> {v}</li>)}</ul>
                )}
                <pre>{c.transcript || 'No transcript.'}</pre>
              </details>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
