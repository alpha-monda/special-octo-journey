import { createFileRoute, Link } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

const PLAN_NAMES: Record<string, string> = { solo: 'Solo', assisted: 'Assisted', growth: 'Growth', office: 'Office' }

export const Route = createFileRoute('/book')({
  head: () => ({ meta: [{ title: 'Book a call | AI Agency XYZ' }] }),
  validateSearch: (search: Record<string, unknown>): { plan?: string } => (typeof search.plan === 'string' && search.plan in PLAN_NAMES ? { plan: search.plan } : {}),
  component: Book,
})

function Book() {
  const { plan } = Route.useSearch()
  const planName = plan ? PLAN_NAMES[plan] : undefined
  const subject = encodeURIComponent(planName ? `Set up my ${planName} agent` : 'Book a call')
  return (
    <StubPage
      eyebrow={planName ? `${planName} plan` : 'Book a call'}
      title={planName ? "Let's set up" : "Let's"}
      accent={planName ? 'your agent.' : 'talk.'}
      body={planName ? "Online checkout is coming soon. Email us and we'll get your agent live." : "Online booking is coming soon. Email us and we'll find a time."}
    >
      <div className="btn-row">
        <a className="pill" href={`mailto:hello@aiagencyxyz.com?subject=${subject}`}>Email us</a>
        <Link to="/agents" hash="demo" className="puff white">Talk to a demo</Link>
      </div>
    </StubPage>
  )
}
