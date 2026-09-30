import { createFileRoute } from '@tanstack/react-router'
import Retell from 'retell-sdk'
import { reportDemoCall, type RetellCall } from '@/server/demo-call-report'

// Receives Retell call events. Set this URL as the webhook on the Retell agent.
// Right now only the master demo agent is handled; customer agents (Phase 6)
// will be routed here by agent_id as well.
export const Route = createFileRoute('/api/retell/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.RETELL_API_KEY
        if (!apiKey) return new Response('Not configured', { status: 503 })

        // Signature is computed over the exact raw body.
        const rawBody = await request.text()
        const signature = request.headers.get('x-retell-signature') ?? ''
        if (!(await Retell.verify(rawBody, apiKey, signature))) {
          return new Response('Invalid signature', { status: 401 })
        }

        const { event, call } = JSON.parse(rawBody) as { event?: string; call?: RetellCall }
        if (event !== 'call_analyzed' || !call?.call_id) return new Response(null, { status: 204 })

        if (call.agent_id && call.agent_id === process.env.RETELL_DEMO_AGENT_ID) {
          try {
            await reportDemoCall(call)
          } catch (error) {
            // A non-2xx response makes Retell retry the webhook.
            console.error('demo call report failed', call.call_id, error)
            return new Response('Report failed', { status: 500 })
          }
        }

        return new Response(null, { status: 204 })
      },
    },
  },
})
