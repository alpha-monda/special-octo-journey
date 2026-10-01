import { createFileRoute } from '@tanstack/react-router'
import Retell from 'retell-sdk'
import { handleCustomerCallEvent } from '@/server/customer-call-report'
import { reportDemoCall, type RetellCall } from '@/server/demo-call-report'

// Receives Retell call events for the master demo agent and every customer
// agent (each agent's webhook_url points here). Routed by agent_id.
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
        if (!event || !call?.call_id || (event !== 'call_ended' && event !== 'call_analyzed')) {
          return new Response(null, { status: 204 })
        }

        try {
          if (call.agent_id && call.agent_id === process.env.RETELL_DEMO_AGENT_ID) {
            if (event === 'call_analyzed') await reportDemoCall(call)
          } else {
            await handleCustomerCallEvent(event, call)
          }
        } catch (error) {
          // A non-2xx response makes Retell retry the webhook.
          console.error('retell webhook handling failed', event, call.call_id, error)
          return new Response('Handling failed', { status: 500 })
        }

        return new Response(null, { status: 204 })
      },
    },
  },
})
