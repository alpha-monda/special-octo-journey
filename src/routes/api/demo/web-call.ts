import { createFileRoute } from '@tanstack/react-router'
import {
  DemoCallError,
  clientIp,
  createDemoWebCall,
  parseDemoInput,
  reserveDemoSlot,
  verifyTurnstile,
} from '@/server/demo-call'

export const Route = createFileRoute('/api/demo/web-call')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
          const input = parseDemoInput(body)
          const ip = clientIp(request)

          await verifyTurnstile(body.turnstileToken, ip)
          const attemptId = await reserveDemoSlot(ip, input.businessType)
          const call = await createDemoWebCall(input, attemptId)

          return Response.json(call, { headers: { 'Cache-Control': 'no-store' } })
        } catch (error) {
          if (error instanceof DemoCallError) {
            return Response.json({ error: error.message }, { status: error.status })
          }
          console.error('demo web-call failed', error)
          return Response.json({ error: 'We could not start the demo call. Please try again in a minute.' }, { status: 502 })
        }
      },
    },
  },
})
