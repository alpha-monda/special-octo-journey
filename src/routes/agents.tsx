import { createFileRoute, Link } from '@tanstack/react-router'
import { DemoCall } from '@/components/DemoCall'
import { CheckOrb, XyzFooter, XyzHeader } from '@/components/XyzChrome'

export const Route = createFileRoute('/agents')({
  head: () => ({
    meta: [
      { title: 'AI Answering Agents | AI Agency XYZ' },
      { name: 'description', content: 'Every call answered, 24/7, on the first ring. Talk to a demo agent built for your business, then go live in three steps.' },
    ],
  }),
  component: AgentsPage,
})

const BENEFITS = [
  { title: 'Never miss a call.', sub: 'Answers 24/7, on the first ring.' },
  { title: 'Never miss a lead.', sub: 'Collects the details. Books the job.' },
  { title: 'Get your time back.', sub: 'You only hear what matters.' },
]

const HOW = [
  { n: '01 · Listen', h: 'Picks up on the first ring.', p: 'Nights, weekends, mid-job. Every time.' },
  { n: '02 · Act', h: 'Books it, routes it, follows up.', p: 'Straight into your calendar.' },
  { n: '03 · Review', h: 'Real people check what matters.', p: 'AI speed. Human judgment.' },
]

type Plan = { id: string; name: string; price: string; minutes: string; items: string[]; tone: 'white' | 'teal' | 'ice'; cta: string }
const PLANS: Plan[] = [
  { id: 'solo', name: 'Solo', price: '$29', minutes: '[__] minutes included', items: ['One agent', 'Answers + takes messages', 'Email summaries'], tone: 'white', cta: 'Start' },
  { id: 'assisted', name: 'Assisted', price: '$99', minutes: '[__] minutes included', items: ['Everything in Solo', 'Human review', 'Books appointments'], tone: 'white', cta: 'Start' },
  { id: 'growth', name: 'Growth', price: '$249', minutes: '[__] minutes included', items: ['Everything in Assisted', 'Smart routing', 'Calendar + CRM links'], tone: 'teal', cta: 'Start' },
  { id: 'office', name: 'Office', price: '$500+', minutes: 'Built for your setup', items: ['Everything in Growth', 'Multiple lines', 'Priority support'], tone: 'ice', cta: 'Contact' },
]

const STEPS = [
  { h: 'Pick a plan.', p: 'Check out in a minute.' },
  { h: 'Tell it about your business.', p: 'Hours, services, what to collect.' },
  { h: 'Forward your calls.', p: 'Keep your number. We show you how.' },
]

function AgentsPage() {
  return (
    <div className="xyz">
      <XyzHeader cta={{ label: 'Get my agent', to: '/agents', hash: 'plans' }} />
      <main>
        <section id="top" className="hero">
          <div className="hero-art">
            <img src="/brand/obj-agents-headphones.webp" alt="AI Answering Agents by XYZ" width={540} height={540} fetchPriority="high" />
          </div>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 30 }}>
            <h1 className="disp h-xl">Every call answered. <em style={{ color: 'var(--x-orange)' }}>Without you.</em></h1>
            {BENEFITS.map((b) => (
              <div key={b.title} className="benefit">
                <CheckOrb />
                <div><h2>{b.title}</h2><p>{b.sub}</p></div>
              </div>
            ))}
            <div className="btn-row" style={{ marginTop: 6 }}>
              <Link to="/agents" hash="plans" className="pill">Set up my agent</Link>
              <Link to="/agents" hash="demo" className="puff">Talk to a demo</Link>
            </div>
          </div>
        </section>

        <section id="demo" className="section demo">
          <div className="demo-copy">
            <p className="eyebrow">Try it now</p>
            <h2 className="disp h-xl">Talk to <em style={{ color: 'var(--x-orange)' }}>your</em> agent.</h2>
            <p className="lead">Two quick boxes. Then call it.</p>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 600, color: '#1C6060' }}>Uses your mic. 3-minute demo.</p>
          </div>
          <DemoCall />
        </section>

        <section id="how" className="section how">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
            <h2 className="disp h-lg" style={{ color: 'var(--x-white)' }}>From “hello” to <em style={{ color: 'var(--x-tangerine)' }}>handled.</em></h2>
            <p className="lead" style={{ color: 'var(--x-white)' }}>Missed calls are missed money. Not anymore.</p>
          </div>
          <div className="grid-3">
            {HOW.map((c) => (
              <div key={c.n} className="quilt dk card-pad">
                <p className="eyebrow" style={{ color: 'var(--x-gold)' }}>{c.n}</p>
                <h3 className="card-h">{c.h}</h3>
                <p className="card-p">{c.p}</p>
              </div>
            ))}
          </div>
          <Link to="/agents" hash="plans" className="pill">Set up my agent</Link>
        </section>

        <section id="time" className="section split" style={{ background: 'var(--x-gray-light)' }}>
          <div className="split-copy" style={{ maxWidth: 520, gap: 28 }}>
            <h2 className="disp h-lg">Stop answering. <em style={{ color: 'var(--x-orange)' }}>Start building.</em></h2>
            <p className="copy">Get back to the work that makes money.</p>
            <Link to="/agents" hash="plans" className="pill">Get my time back</Link>
          </div>
          <div className="grid-2">
            <div className="quilt card-pad" style={{ background: 'var(--x-white)', gap: 22 }}>
              <p className="eyebrow">Off your plate</p>
              {['Answering every ring', 'Same questions, all day', 'Booking + rescheduling', 'Chasing voicemails'].map((t) => <div key={t} className="big-li">{t}</div>)}
            </div>
            <div className="quilt dk card-pad" style={{ gap: 22 }}>
              <p className="eyebrow" style={{ color: 'var(--x-gold)' }}>Back on your plate</p>
              {['Closing deals', 'Doing the real work', 'Growing the business', 'Logging off on time'].map((t) => <div key={t} className="big-li">{t}</div>)}
            </div>
          </div>
        </section>

        <section id="plans" className="section" style={{ background: 'var(--x-gray-light)', display: 'flex', flexDirection: 'column', gap: 48, paddingTop: 0 }}>
          <div className="plans-head">
            <h2 className="disp h-lg">Pick your <em style={{ color: 'var(--x-orange)' }}>plan.</em></h2>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Cancel anytime.</p>
          </div>
          <div className="grid-4">
            {PLANS.map((p) => {
              const dark = p.tone === 'teal'
              const accent = dark ? 'var(--x-gold)' : p.tone === 'ice' ? 'var(--x-teal)' : 'var(--x-orange)'
              return (
                <div key={p.id} className={`quilt tier ${dark ? 'dk' : ''}`} style={{ background: p.tone === 'ice' ? 'var(--x-ice)' : dark ? undefined : 'var(--x-white)', color: p.tone === 'ice' ? 'var(--x-teal)' : dark ? 'var(--x-white)' : 'var(--x-gray)' }}>
                  <p className="eyebrow" style={{ color: accent }}>{p.name}</p>
                  <div><span className="disp price">{p.price}</span><span style={{ fontSize: 20, fontWeight: 700 }}>/mo</span></div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: accent }}>{p.minutes}</p>
                  <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                  {p.id === 'office' ? (
                    <Link to="/book" className="puff teal sm go">{p.cta}</Link>
                  ) : (
                    <Link to="/book" search={{ plan: p.id }} className="puff white sm go">{p.cta}</Link>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section id="setup" className="section" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          <h2 className="disp h-lg">Live in <em style={{ color: 'var(--x-orange)' }}>three steps.</em></h2>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.h}>
                <div className="step-n">{i + 1}</div>
                <h3 className="card-h">{s.h}</h3>
                <p className="card-p">{s.p}</p>
              </div>
            ))}
          </div>
          <Link to="/agents" hash="plans" className="pill">Set up my agent</Link>
        </section>

        <section id="start" className="section" style={{ paddingTop: 0 }}>
          <div className="quilt dk cta-panel">
            <h2 className="disp">Your next caller is <em style={{ color: 'var(--x-gold)' }}>dialing now.</em></h2>
            <Link to="/agents" hash="plans" className="pill">Set up my agent</Link>
          </div>
        </section>
      </main>
      <XyzFooter />
    </div>
  )
}
