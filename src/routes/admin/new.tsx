import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Loader2, Rocket } from 'lucide-react'
import { useState } from 'react'
import { AgentSettingsForm } from '@/components/AgentSettingsForm'
import { emptySettings, type AgentSettings } from '@/lib/agent-settings'
import { CustomerFields, type CustomerForm } from '@/components/CustomerFields'
import { createCustomer, getVoices } from '@/server/admin.functions'

export const Route = createFileRoute('/admin/new')({
  loader: () => getVoices(),
  component: NewCustomer,
})

function NewCustomer() {
  const voices = Route.useLoaderData()
  const router = useRouter()
  const [settings, setSettings] = useState<AgentSettings>(() => ({ ...emptySettings(), voiceId: voices.find((v) => v.id === 'retell-Cimo')?.id ?? '' }))
  const [customer, setCustomer] = useState<CustomerForm>({ contactName: '', contactEmail: '', plan: 'solo', notifyEmails: '' })
  const [areaCode, setAreaCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await createCustomer({ data: { customer, settings, areaCode } })
      // Even if provisioning failed, the customer exists; its page offers a retry.
      await router.navigate({ to: '/admin/customers/$id', params: { id: String(result.id) }, search: result.ok ? {} : { error: result.error } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="admin-title-row"><h1>New customer</h1></div>
      <div className="admin-card">
        <fieldset>
          <legend>Customer</legend>
          <CustomerFields value={customer} onChange={setCustomer} />
        </fieldset>
        <AgentSettingsForm value={settings} onChange={setSettings} voices={voices} />
        <fieldset>
          <legend>5 · Phone number</legend>
          <label className="admin-narrow">
            <span>Preferred area code</span>
            <input inputMode="numeric" maxLength={3} value={areaCode} onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, ''))} placeholder="512" />
            <small>Leave blank for any US number. Numbers cost about $2/month on your Retell account.</small>
          </label>
        </fieldset>
        {error && <p className="agent-error" role="alert">{error}</p>}
        <button className="button button-dark" disabled={busy}>
          {busy ? <><Loader2 className="spin" size={17} /> Creating agent and buying number…</> : <><Rocket size={17} /> Create agent and launch</>}
        </button>
      </div>
    </form>
  )
}
