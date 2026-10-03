import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="About us" title="Human-centered." accent="AI-supported." body="We design around your people. AI does the heavy lifting. The full story is coming soon." />
  ),
})
