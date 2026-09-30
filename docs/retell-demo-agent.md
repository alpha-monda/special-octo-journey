# Master demo agent (Retell dashboard setup)

The "Talk to it" page (`/agent`) runs every visitor's demo against **one** Retell
agent. The visitor's answers are sent as dynamic variables, so the same agent
sounds like it was built for their business.

## 1. Create the agent

In the Retell dashboard: **Agents → Create → Single Prompt (Retell LLM)**.

- **Voice:** any natural English voice (this is the demo default).
- **Welcome message / begin message:** "AI speaks first", with:

  ```
  Hi, thanks for calling {{business_name}}! Just so you know, this call may be recorded. How can I help you today?
  ```

- **Prompt:** paste the prompt below.
- **Max call duration:** 3 minutes. The site also enforces this per call, but
  setting it on the agent is a second safety net.
- **Webhook URL:** `https://aiagencyxyz.com/api/retell/webhook`. After each demo call,
  Retell sends the call here and the site emails the summary and transcript to
  `DEMO_NOTIFY_EMAIL`. Keep the default webhook events (they include `call_analyzed`).
- **Post-call analysis:** leave the default call summary turned on.

Copy the agent ID (starts with `agent_`); it goes into `RETELL_DEMO_AGENT_ID`.

## 2. Prompt

```
## Identity
You are the AI phone receptionist for {{business_name}}, a {{business_type}}.
Speak in a {{tone}} way. You are on a live phone call, so keep every reply short
(one to two sentences), natural, and conversational. Never use lists, markdown,
emojis, or read out URLs.

## What you do for this business
{{objectives}}

## Information to collect
Before the call ends, collect the following from the caller, one item at a time,
in a natural way (don't read them off as a list):
{{fields_to_collect}}
Confirm phone numbers and spellings back to the caller.

## Rules
- You don't have this business's real calendar, prices, or policies. If asked for
  specifics you don't know, say you'll have the team confirm, and take a message.
- Never invent prices, availability, medical, legal, or financial advice.
- If the caller describes an emergency, tell them to hang up and call 911 (or
  the relevant emergency line) right away.
- This call is a short demo capped at about three minutes. Once you've collected
  the information, briefly recap what you took down, say someone from
  {{business_name}} will follow up, and end the call politely.
- If the caller asks whether you're an AI, say yes, you're an AI receptionist
  built by AI AGENCY XYZ.
```

## 3. Netlify environment variables

Set these in **Netlify → Project configuration → Environment variables**
(never in code):

| Variable | What it is |
| --- | --- |
| `RETELL_API_KEY` | Retell secret API key (Retell dashboard → API Keys) |
| `RETELL_DEMO_AGENT_ID` | The agent ID from step 1 |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile **site key** (public, used in the browser) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile **secret key** |
| `DEMO_IP_SALT` | Any long random string; used to hash visitor IPs |
| `DEMO_DAILY_CAP` | Optional. Max demo calls per day across all visitors (default 150) |
| `DEMO_NOTIFY_EMAIL` | Where demo call summaries go (comma-separate multiple addresses) |
| `SMTP_USER` | The Hostinger mailbox that sends the emails, e.g. `hello@aiagencyxyz.com` |
| `SMTP_PASSWORD` | That mailbox's password (mark it as a secret in Netlify) |

**Retell API key:** the webhook is verified with `RETELL_API_KEY`, so use the Retell key
that has the **webhook** badge in Retell's API Keys page.

**Sending email:** demo call emails are sent from your Hostinger mailbox over SMTP
(`smtp.hostinger.com`, port 465). Nothing else to set up; no DNS changes needed.
Optional overrides: `SMTP_HOST`, `SMTP_PORT`, `EMAIL_FROM` (e.g. `AI AGENCY XYZ <hello@aiagencyxyz.com>`).
Resend is also supported instead (`RESEND_API_KEY`); SMTP wins if both are set.

To get Turnstile keys, go to the Cloudflare dashboard: **Turnstile → Add widget**, and add the
hostnames `aiagencyxyz.com` and `localhost`. It's free and doesn't require moving DNS
to Cloudflare.

`VITE_TURNSTILE_SITE_KEY` is read at build time, so trigger a new deploy after
setting it.

## Guardrails built in

- Cloudflare Turnstile bot check, verified server-side on every request.
- Per-IP limits: 3 demo calls per hour, 6 per day. Global cap: `DEMO_DAILY_CAP` per day.
  Limits are stored in the `demo_call_attempts` table (IP stored only as a salted hash).
- Each call is created with `max_call_duration_ms = 180000` and ends after 20s of silence.
- Visitor text is length-limited and stripped of control characters and `{}` before
  it reaches the prompt.
- The Retell API key never leaves the server.
