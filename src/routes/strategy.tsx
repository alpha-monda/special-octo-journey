import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/strategy')({
  head: () => ({ meta: [{ title: 'AI Strategy & Training | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="AI strategy & training" title="Find the wins." accent="Train your team." body="This page is on its way. Want to talk about where AI fits in your business? Send us a note." />
  ),
})
