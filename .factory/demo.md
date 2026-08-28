# Demo sandbox

## Entry point

- Hosted: `https://presence-bridge.sociobot.in/demo`
- Local: run `npm run dev`, then open `http://localhost:4173/demo`
- Desktop first run: choose **Load sample project** from the empty roster.

## Included sample

The demo contains four colleagues in a five-person studio: Ava Shah, Leo Martin, Noor Okafor, and Mina Park. Their statuses cover available, calendar-derived busy, away, and offline. Saved handoffs cover Slack, Teams, Google Meet, and email.

## Isolation and reset

The web demo uses `sessionStorage` under `demo:presence-bridge:v1`. It never reads or writes `presence-bridge:v1`, the real roster key. Closing the tab clears the session. **Reset demo** restores the bundled sample immediately. **Start for real** opens the empty local roster without copying demo changes.

Tests use a fresh browser context and only `/demo`. Contact handoffs are reported but external apps are not launched in demo mode.
