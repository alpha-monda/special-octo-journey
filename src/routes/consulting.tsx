import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Compass, Network, Rocket, Wrench } from 'lucide-react'
import { XyzFooter, XyzHeader } from '@/components/XyzChrome'

export const Route = createFileRoute('/consulting')({ component: Consulting })

const services = [
  { icon: Compass, title: 'Discovery + call mapping', copy: 'Identify caller intents, edge cases, business rules, and the handoffs your team actually needs.' },
  { icon: Wrench, title: 'Agent design + testing', copy: 'Shape the voice, prompts, knowledge, guardrails, and realistic test scenarios before launch.' },
  { icon: Network, title: 'Systems integration', copy: 'Connect Retell, calendars, CRMs, phone data, client systems, or automated exports for analysis.' },
  { icon: Rocket, title: 'Launch + optimization', copy: 'Monitor outcomes, review conversations, tune workflows, and expand what your agent can handle.' },
]

function Consulting() {
  return (
    <div className="page-shell cream-page">
      <XyzHeader />
      <main>
        <section className="consulting-hero">
          <div><p className="eyebrow">Strategy, build, launch</p><h1>We turn your phone chaos into a working system.</h1></div>
          <div className="consulting-ticket"><span>BUILD SESSION</span><strong>01</strong><p>Map the calls. Design the agent. Connect the tools.</p><a href="mailto:hello@aiagencyxyz.com?subject=AI%20agent%20build%20session" className="button button-dark">Start the conversation <ArrowRight size={18} /></a></div>
        </section>
        <section className="service-grid">
          {services.map((service, index) => {
            const Icon = service.icon
            return <article key={service.title}><span>0{index + 1}</span><Icon size={28} /><h2>{service.title}</h2><p>{service.copy}</p></article>
          })}
        </section>
        <section className="engagement-panel">
          <div><p className="kicker light">Typical engagement</p><h2>From first whiteboard to first answered call.</h2></div>
          <div className="engagement-list">
            {['Focused discovery workshop', 'Call flow + escalation blueprint', 'Retell agent configuration', 'Integration and data setup', 'Launch support + optimization plan'].map(item => <p key={item}><CheckCircle2 />{item}</p>)}
          </div>
          <div className="engagement-price"><span>STARTUP FEES</span><strong>$500–$3,500</strong><small>Quoted after discovery. Monthly platform plan is separate.</small><Link to="/pricing" className="text-link light-link">Review platform plans <ArrowRight size={15} /></Link></div>
        </section>
      </main>
      <XyzFooter />
    </div>
  )
}
