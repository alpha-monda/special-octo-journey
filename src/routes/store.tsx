import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/store')({
  head: () => ({ meta: [{ title: 'AI Fans Store | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="AI Fans Store" title="Merch for" accent="AI fans." body="Our store is opening soon. Want a heads-up when it does? Send us a note." />
  ),
})
