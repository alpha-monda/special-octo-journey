import { createFileRoute, redirect } from '@tanstack/react-router'

// The demo moved into /agents. Keep old links working.
export const Route = createFileRoute('/agent')({
  beforeLoad: () => {
    throw redirect({ to: '/agents', hash: 'demo', statusCode: 301 })
  },
})
