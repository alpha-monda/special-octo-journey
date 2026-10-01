// Customer contact + plan fields shared by the admin new-customer and customer pages.

export type CustomerForm = { contactName: string; contactEmail: string; plan: string; notifyEmails: string }

export const PLANS = [
  { id: 'solo', label: 'Solo (no human review)' },
  { id: 'assisted', label: 'Assisted' },
  { id: 'growth', label: 'Growth' },
  { id: 'office', label: 'Office' },
]

export function CustomerFields({ value, onChange }: { value: CustomerForm; onChange: (v: CustomerForm) => void }) {
  const text = (key: keyof CustomerForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [key]: e.target.value })
  return (
    <div className="admin-grid">
      <label><span>Contact name</span><input value={value.contactName} onChange={text('contactName')} /></label>
      <label><span>Contact email</span><input type="email" value={value.contactEmail} onChange={text('contactEmail')} /></label>
      <label>
        <span>Plan</span>
        <select value={value.plan} onChange={text('plan')}>{PLANS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
      </label>
      <label>
        <span>Send call summaries to *</span>
        <input required value={value.notifyEmails} onChange={text('notifyEmails')} placeholder="owner@business.com, frontdesk@business.com" />
      </label>
    </div>
  )
}
