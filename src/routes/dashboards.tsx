import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/dashboards')({
  head: () => ({ meta: [{ title: 'AI Data Dashboards | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="AI data dashboards" title="Your numbers," accent="at a glance." body="This page is on its way. Want one place to see calls, leads, and sales? Send us a note." />
  ),
})
