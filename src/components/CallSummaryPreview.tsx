import { useState } from 'react'

// "After every call" on /agents: an example of the summary a customer gets,
// mirroring the real email in src/server/customer-call-report.ts.

const OPTIONS = ['Email', 'Text', 'Both'] as const
type Option = (typeof OPTIONS)[number]

export function CallSummaryPreview() {
  const [pick, setPick] = useState<Option>('Both')
  const showEmail = pick !== 'Text'
  const showText = pick !== 'Email'

  return (
    <section id="summary" className="section summary">
      <div className="summary-copy">
        <p className="eyebrow">After every call</p>
        <h2 className="disp h-lg">You get the <em style={{ color: 'var(--x-orange)' }}>gist.</em></h2>
        <p className="lead">Who called, what they need, and how to reach them. By email, text, or both. Your pick.</p>
        <div className="chips" role="group" aria-label="Show an example summary by">
          {OPTIONS.map((o) => (
            <button key={o} type="button" className="chip-btn" aria-pressed={pick === o} onClick={() => setPick(o)}>{o}</button>
          ))}
        </div>
      </div>

      <div className="summary-view" aria-live="polite">
        {showEmail && (
          <article className="quilt mock-email no-stitch" aria-label="Example summary email">
            <p className="meta"><strong>Subject:</strong> New call from (555) 010-4477</p>
            <h3>New call for Rivera Plumbing</h3>
            <p>Maria's kitchen sink is leaking under the cabinet. She'd like someone out tomorrow morning and asked about the service-call fee.</p>
            <dl>
              <dt>Name</dt><dd>Maria Lopez</dd>
              <dt>Phone</dt><dd>(555) 010-4477</dd>
              <dt>Reason</dt><dd>Leaking kitchen sink</dd>
              <dt>Length</dt><dd>1m 42s</dd>
            </dl>
            <p className="more">+ full transcript</p>
          </article>
        )}
        {showText && (
          <div className="mock-phone" aria-label="Example summary text message">
            <div className="screen">
              <p className="from">AI AGENCY XYZ</p>
              <p className="bubble">New call for Rivera Plumbing: Maria Lopez, (555) 010-4477. Leaking kitchen sink, wants a visit tomorrow morning. Full details in your email.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
