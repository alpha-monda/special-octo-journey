import { createFileRoute, redirect } from '@tanstack/react-router'

// "About" became the Human-First AI Philosophy page. Keep old links working.
export const Route = createFileRoute('/about')({
  beforeLoad: () => {
    throw redirect({ to: '/philosophy', statusCode: 301 })
  },
})
