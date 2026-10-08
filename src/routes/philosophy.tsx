import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/philosophy')({
  head: () => ({ meta: [{ title: 'Human-First AI Philosophy | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="Human-first AI" title="Human-centered." accent="AI-supported." body="We design around your people. AI does the heavy lifting. The full story is coming soon." />
  ),
})
