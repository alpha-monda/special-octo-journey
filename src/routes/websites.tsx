import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/websites')({
  head: () => ({ meta: [{ title: 'AI-Enabled Websites | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="AI-enabled websites" title="Sites that answer," accent="book, and sell." body="This page is on its way. Need a site that works as hard as you do? Send us a note." />
  ),
})
