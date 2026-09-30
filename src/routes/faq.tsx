import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export const Route = createFileRoute('/faq')({ component: Faq })

const questions = [
  ['What powers the calls?', 'Retell AI is the core voice platform. AI AGENCY XYZ adds strategy, call-flow design, business integrations, analytics, human review, and ongoing optimization around it.'],
  ['What does human review include?', 'On Levels 2–4, selected calls and flagged outcomes can be reviewed by a person for quality, exceptions, escalation accuracy, and next-step confirmation. The exact workflow is defined during setup.'],
  ['Can you connect our existing phone data?', 'Yes. Where direct business calling data is available, it can be connected. Otherwise, we can connect your client system or automate an export for downstream analysis.'],
  ['Are setup fees included in the monthly plan?', 'No. Startup and consulting fees cover discovery, call-flow architecture, configuration, integrations, testing, and launch. Typical projects range from $500 to $3,500.'],
  ['Can this support multiple offices or lines?', 'Yes. The Office plan is designed for multiple locations, phone lines, departments, or complex routing logic.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return <div className="page-shell cream-page"><SiteHeader /><main><section className="subpage-hero faq-hero"><p className="eyebrow">Straight answers</p><h1>Before your agent<br /><i>says hello.</i></h1></section><section className="faq-list">{questions.map(([question, answer], index) => <article className={open === index ? 'open' : ''} key={question}><button onClick={() => setOpen(open === index ? -1 : index)}><span>0{index + 1}</span><strong>{question}</strong><ChevronDown /></button>{open === index && <p>{answer}</p>}</article>)}</section></main><SiteFooter /></div>
}
