import { createFileRoute, Link } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="Contact" title="Let's" accent="talk." body="Tell us what's eating your time, and we'll take it from there.">
      <div className="btn-row">
        <a className="pill" href="mailto:hello@aiagencyxyz.com">hello@aiagencyxyz.com</a>
        <Link to="/agents" hash="demo" className="puff white">Talk to a demo</Link>
      </div>
    </StubPage>
  ),
})
