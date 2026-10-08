import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/marketing')({
  head: () => ({ meta: [{ title: 'AI-Optimized Marketing | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="AI-optimized marketing" title="Marketing that" accent="learns." body="This page is on its way. Want campaigns that get smarter every week? Send us a note." />
  ),
})
