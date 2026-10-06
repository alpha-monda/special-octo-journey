# XYZ Answering Agent: Build Plan

Living plan for the self-serve answering-agent product. The original spec phases are kept,
but the order and a few decisions changed. Update this file when a decision changes.

## Decisions so far

| Topic | Decision |
| --- | --- |
| Agents | One Retell agent (+ its own Retell LLM) per customer, created by API |
| Phone numbers | One Retell number per customer, bound to their agent; customer forwards unanswered calls to it |
| Demo | Browser web call against one master demo agent (`/agent`). Live. |
| Email sending | Hostinger SMTP from `hello@aiagencyxyz.com` (Resend supported as fallback) |
| Bot protection | Cloudflare Turnstile |
| Human review | **Solo plan: none (fully hands-off).** Assisted / Growth / Office include human review: exact reviewer duties still TBD |
| Agent changes | Agents never change themselves. Suggestions are automatic; applying them needs a human click |
| Build order | **Admin-first:** the provisioning engine ships behind an admin page so the owner can onboard pilot customers by hand, then self-serve (Stripe, login, wizard) is layered on top of the same engine |

## Open decisions (owner)

1. Plan prices, included minutes, overage rate (Solo / Assisted / Growth / Office)
2. What "human review" means for Levels 2–4 (who, what they do, how fast)
3. Login provider for customers (recommendation: Netlify Identity)
4. Voices offered to customers (admin page lists all Retell voices with previews)
5. SMS launch timing (needs A2P 10DLC approval)

## Phases

### Done
- **Phase 1: Demo.** `/agent`, `POST /api/demo/web-call`, Turnstile, rate limits, 3-min cap.
- **Demo call emails.** `POST /api/retell/webhook` emails summary + transcript of each demo call.

### Built: Agent engine + admin (spec Phases 5, 6 and part of 8). Needs `ADMIN_PASSWORD` + Retell billing to use live
- Admin login (`ADMIN_PASSWORD`), `/admin` customer list, new-customer form, customer page
- Provisioning: build prompt → create Retell LLM → create agent → buy number → bind; roll back on failure
- Edit settings → update the same LLM/agent (no new agent); **version history with one-click restore**
- Pause / resume (unbind / rebind the number)
- Per-call delivery: store every call; email the customer summary, collected fields, caller number, transcript
- "Call it now" test link and forwarding instructions on the customer page
- Post-call analysis extracts each "what to collect" field plus `unanswered_questions` and `is_urgent`; urgent calls are flagged in the email subject

### Redesign (branch `design-refresh`, awaiting approval)
- Steps 1–5 of the design handoff: tokens + shared components, homepage, `/agents` (demo wired to Retell), mobile pass, stub routes
- "After every call" section on /agents shows an example summary email and text (Email / Text / Both toggle). Texts need A2P 10DLC before launch
- Demo form asks only name + business name ("2 of 25+ settings"); the server fills in type, objectives and fields to collect
- Plan prices shown: Solo $29 · Assisted $99 · Growth $249 · Office $500+; minutes still `[__]` until set

### Next
- **Self-improvement loop.** Retell post-call analysis already extracts `unanswered_questions` and
  `is_urgent` (plus Retell's caller sentiment) per call, already wired in the engine. Next: a weekly "report card" email listing
  repeated unanswered questions with a one-click "add this answer to my FAQs"; a "this call wasn't
  handled well" flag on each call. Levels 2–4: the human reviewer works these instead of the customer.
- **Carrier forwarding guides:** AT&T, Verizon, T-Mobile, Comcast Business, RingCentral, Google Voice
- **Privacy policy + terms:** recording, transcripts, retention, deletion (lawyer review before launch)

### Then: self-serve (spec Phases 2, 3, 4, 8)
- Plans + Stripe Checkout + webhook (pending_setup → live; payment failed → paused; canceled → release number)
- Customer login, linked to the Stripe customer
- `/setup` wizard: same settings model and provisioning engine as the admin form
- `/dashboard`: real calls, minutes vs cap, edit settings (with version history), pause, billing portal
- Usage tracking + Stripe overage reporting

### Later
- SMS summaries (Twilio, after A2P 10DLC)
- Google Sheet call log
- Human review queue for Levels 2–4 (`call_records.human_review_status` already exists)
- Alerts to the owner when provisioning or delivery fails
