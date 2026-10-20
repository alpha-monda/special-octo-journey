import { createFileRoute } from '@tanstack/react-router'

// Connectivity check: calls Retell's list-agents endpoint with RETELL_API_KEY and
// reports only the HTTP status. Never returns the key or the agent list.
export const Route = createFileRoute('/api/retell-test')({
  server: {
    handlers: {
      GET: async () => {
        const headers = { 'Cache-Control': 'no-store' }
        const apiKey = process.env.RETELL_API_KEY
        if (!apiKey) {
          return Response.json({ ok: false, status: null, error: 'RETELL_API_KEY is not set' }, { status: 500, headers })
        }

        const baseUrl = process.env.RETELL_BASE_URL || 'https://api.retellai.com'
        try {
          const res = await fetch(`${baseUrl}/v2/list-agents?limit=1`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: '{}',
          })
          return Response.json({ ok: res.ok, status: res.status }, { headers })
        } catch (error) {
          console.error('retell-test request failed', error)
          return Response.json({ ok: false, status: null, error: 'Could not reach Retell' }, { status: 502, headers })
        }
      },
    },
  },
})
