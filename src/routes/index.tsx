import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowDownRight,
  ArrowRight,
  AudioWaveform,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  Check,
  Headphones,
  PhoneCall,
  Route as RouteIcon,
  Sparkles,
  UserCheck,
} from 'lucide-react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export const Route = createFileRoute('/')({ component: Home })

const calls = [
  { name: 'New patient intake', time: '2m 48s', result: 'Booked', tone: 'mint' },
  { name: 'After-hours repair', time: '4m 12s', result: 'Escalated', tone: 'orange' },
  { name: 'Pricing inquiry', time: '1m 36s', result: 'Qualified', tone: 'blue' },
]

function Home() {
  return (
    <div className="page-shell">
      <div className="hero-wrap">
        <SiteHeader />
        <main>
          <section className="hero-section">
            <div className="eyebrow reveal reveal-1"><span className="live-dot" /> AI answering agents + real humans</div>
            <h1 className="hero-title reveal reveal-2">
              Your best employee<br />
              <span className="hero-title-accent">answers every call.</span>
            </h1>
            <div className="hero-lower reveal reveal-3">
              <p className="hero-copy">AI phone agents that answer, route, qualify, book, and follow up—backed by human review when the conversation matters most.</p>
              <div className="hero-actions">
                <Link to="/consulting" className="button button-dark">Build my agent <ArrowRight size={18} /></Link>
                <Link to="/dashboard" className="button button-ghost">Explore the dashboard</Link>
              </div>
            </div>

            <div className="hero-visual reveal reveal-4">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="floating-note note-one"><Sparkles size={15} /> Sounds natural</div>
              <div className="floating-note note-two"><UserCheck size={15} /> Human reviewed</div>
              <div className="agent-orb">
                <div className="orb-core"><PhoneCall size={34} /></div>
                <div className="sound-bars" aria-hidden="true">
                  {[18, 34, 50, 28, 42, 20, 38].map((height, index) => <span key={index} style={{ height }} />)}
                </div>
                <p>AI agent live</p>
                <strong>00:42</strong>
              </div>
              <div className="call-stack">
                <div className="call-stack-head"><span>Live call intelligence</span><span>Today</span></div>
                {calls.map((call) => (
                  <div className="call-mini" key={call.name}>
                    <span className={`call-icon ${call.tone}`}><AudioWaveform size={16} /></span>
                    <div><strong>{call.name}</strong><small>{call.time} · Transcript ready</small></div>
                    <em>{call.result}</em>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>

      <section className="trust-strip">
        <span>BUILT ON RETELL AI</span><span>•</span><span>VOICE + SMS</span><span>•</span><span>HUMAN REVIEW</span><span>•</span><span>SMART ROUTING</span><span>•</span><span>CALL ANALYTICS</span>
      </section>

      <section className="section cream-section" id="how-it-works">
        <div className="section-heading split-heading">
          <div><span className="section-number">01</span><p className="kicker">One system, every call</p></div>
          <h2>From “hello” to<br /><i>handled.</i></h2>
        </div>
        <div className="process-grid">
          <article className="process-card process-card-dark">
            <span>01 / LISTEN</span>
            <div className="process-icon"><Headphones /></div>
            <h3>Answers like your best front desk person.</h3>
            <p>Natural, on-brand conversations trained around your services, policies, locations, and preferred tone.</p>
          </article>
          <article className="process-card">
            <span>02 / ACT</span>
            <div className="process-icon orange"><RouteIcon /></div>
            <h3>Routes, books, qualifies, and follows up.</h3>
            <p>Connect calendars, route urgent callers, capture lead details, and trigger the next step automatically.</p>
          </article>
          <article className="process-card process-card-feature">
            <span>03 / REVIEW</span>
            <div className="review-stamp"><BadgeCheck size={42} /><strong>HUMAN<br />CHECKED</strong></div>
            <h3>AI speed. Human judgment.</h3>
            <p>Every plan above Solo includes a human review layer for exceptions, quality checks, and important outcomes.</p>
          </article>
        </div>
      </section>

      <section className="section signal-section">
        <div className="signal-copy">
          <p className="kicker light">Built for real operations</p>
          <h2>Every conversation becomes a business signal.</h2>
          <p>See what callers ask, where leads convert, why calls escalate, and what your team should do next—all in one clear dashboard.</p>
          <Link to="/dashboard" className="button button-light">See the call dashboard <ArrowDownRight size={18} /></Link>
        </div>
        <div className="metrics-panel">
          <div className="metric-feature">
            <span>CALLS ANSWERED</span><strong>1,284</strong><small>↑ 18.4% this month</small>
            <div className="bar-chart" aria-label="Call volume chart">
              {[42, 62, 51, 78, 67, 92, 76, 100, 86, 113, 96, 126].map((height, index) => <i key={index} style={{ height }} />)}
            </div>
          </div>
          <div className="metric-row">
            <div><CalendarCheck /><span>Appointments</span><strong>247</strong></div>
            <div><BarChart3 /><span>Qualified leads</span><strong>68%</strong></div>
          </div>
        </div>
      </section>

      <section className="section pricing-preview">
        <div className="section-heading centered-heading">
          <p className="kicker">Four ways to answer better</p>
          <h2>Start at $29.<br /><i>Scale without ceilings.</i></h2>
          <p>Every business gets a tailored call flow. Human review is included from Level 2 onward.</p>
        </div>
        <div className="tier-ribbon">
          {[
            ['01', 'SOLO', '$29', 'One agent. Simple answers.'],
            ['02', 'ASSISTED', '$99', 'Human review included.'],
            ['03', 'GROWTH', '$249', 'Routing + integrations.'],
            ['04', 'OFFICE', '$500', 'Multi-line complexity.'],
          ].map(([level, name, price, copy], index) => (
            <article key={name} className={index === 2 ? 'featured-tier' : ''}>
              <span>{level}</span><h3>{name}</h3><p><b>{price}</b>/mo</p><small>{copy}</small>
              {index > 0 && <em><Check size={12} /> HUMAN REVIEW</em>}
            </article>
          ))}
        </div>
        <div className="center-action"><Link to="/pricing" className="button button-dark">Compare all plans <ArrowRight size={18} /></Link></div>
      </section>

      <section className="closing-cta">
        <div>
          <p className="kicker">Your next caller is already dialing</p>
          <h2>Make sure someone<br /><i>great</i> answers.</h2>
        </div>
        <div>
          <p>Strategy, call-flow design, integration setup, launch, and optimization—handled end to end.</p>
          <Link to="/consulting" className="button button-dark">Book a build session <ArrowRight size={18} /></Link>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
