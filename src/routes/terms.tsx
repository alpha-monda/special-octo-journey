import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/terms')({
  head: () => ({ meta: [{ title: 'Terms | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="Terms" title="Terms of service" body="Our full terms are being finalized. Questions? Email hello@aiagencyxyz.com." />
  ),
})
