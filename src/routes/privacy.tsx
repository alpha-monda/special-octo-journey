import { createFileRoute } from '@tanstack/react-router'
import { StubPage } from '@/components/StubPage'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy | AI Agency XYZ' }] }),
  component: () => (
    <StubPage eyebrow="Privacy" title="Privacy policy" body="Our full privacy policy is being finalized. Questions about your data, call recordings, or transcripts? Email hello@aiagencyxyz.com." />
  ),
})
