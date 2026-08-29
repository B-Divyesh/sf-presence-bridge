# Demo sandbox

## Entry point

- Hosted one-click path: `https://presence-bridge.sociobot.in/?demo=1`
- Stable route: `https://presence-bridge.sociobot.in/demo`
- Local: run `npm run dev`, then open `http://localhost:4173/?demo=1`
- Desktop first run: choose **Load sample project** from the empty roster.

## Included sample

The demo contains four teammates plus the visitor's status: Ava Shah, Leo Martin, Noor Okafor, and Mina Park. Their statuses cover available, calendar-derived busy, away, and offline. Saved contact tools cover Slack, Teams, Google Meet, and email. At 390 × 844, the compact demo heading keeps the first two teammate rows in the initial viewport.

## Isolation and reset

The web demo uses `sessionStorage` under `demo:presence-bridge:v1`. It never reads or writes `presence-bridge:v1`, the real roster key. Closing the tab clears the session. **Reset demo** restores the bundled sample immediately. **Start for real** removes the demo key before opening the empty local roster.

The real app's Settings panel can download a presence update and import one from a teammate. This is deliberately absent from the demo flow: a shared update is a real user's explicit file, never demo data. The file carries only the publisher's chosen name, role, status, note, status source, and update time—never calendar events, tools, activity, or messages.

Tests use a fresh browser context and only the demo entry points. Contact tool openings are reported, but external apps are not launched in demo mode.
