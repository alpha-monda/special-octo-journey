import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Check, Minus } from 'lucide-react'
import { useState } from 'react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export const Route = createFileRoute('/pricing')({ component: Pricing })

const plans = [
  { level: '01', name: 'Solo', monthly: 29, blurb: 'For one operator with a straightforward call flow.', features: ['1 AI answering agent', 'Core call transcripts', 'Lead capture', 'Email call summaries'], review: false },
  { level: '02', name: 'Assisted', monthly: 99, blurb: 'For busy professionals who want an extra set of eyes.', features: ['Everything in Solo', 'Human review included', 'Appointment booking', 'Priority escalation rules'], review: true },
  { level: '03', name: 'Growth', monthly: 249, blurb: 'For teams coordinating leads across tools and people.', features: ['Everything in Assisted', 'Advanced routing', 'CRM + calendar handoffs', 'Custom dashboard reporting'], review: true, featured: true },
  { level: '04', name: 'Office', monthly: 500, blurb: 'For multi-line offices and complex routing environments.', features: ['Multiple lines or locations', 'Complex routing logic', 'Dedicated optimization', 'Custom data workflows'], review: true },
]

function Pricing() {
  const [annual, setAnnual] = useState(false)
  return (
    <div className="page-shell cream-page">
      <SiteHeader />
      <main>
        <section className="subpage-hero">
          <p className="eyebrow">Plans built around call complexity</p>
          <h1>Four levels.<br /><i>Zero missed opportunities.</i></h1>
          <p>Start lean, then add human oversight, smarter routing, and connected workflows as your operation grows.</p>
          <div className="billing-toggle" aria-label="Billing frequency">
            <button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Monthly</button>
            <button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Annual <span>save 15%</span></button>
          </div>
        </section>
        <section className="pricing-grid-full">
          {plans.map((plan) => {
            const price = annual ? Math.round(plan.monthly * 0.85) : plan.monthly
            return (
              <article className={`pricing-card-full ${plan.featured ? 'featured' : ''}`} key={plan.name}>
                {plan.featured && <div className="popular-tag">Most flexible</div>}
                <div className="pricing-card-top"><span>{plan.level}</span>{plan.review ? <em><Check size={12} /> Human review</em> : <em className="muted"><Minus size={12} /> AI only</em>}</div>
                <h2>{plan.name}</h2>
                <p className="plan-blurb">{plan.blurb}</p>
                <p className="plan-price"><strong>${price}</strong><span>/ month</span></p>
                <p className="billing-note">{annual ? 'Billed annually' : 'Month-to-month'}</p>
                <ul>{plan.features.map(feature => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                <Link to="/consulting" className={`button ${plan.featured ? 'button-light' : 'button-dark'}`}>Choose {plan.name} <ArrowRight size={17} /></Link>
              </article>
            )
          })}
        </section>
        <section className="fees-panel">
          <div><p className="kicker light">One-time setup</p><h2>Designed around your actual business.</h2></div>
          <div><p>Implementation and consulting fees cover discovery, prompt and call-flow design, integrations, testing, and launch.</p><strong>Typical startup investment: $500–$3,500</strong><small>Final scope depends on locations, integrations, routing, and review requirements.</small></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
