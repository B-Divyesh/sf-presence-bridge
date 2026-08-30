# Independent verification 13 — PASS

**Candidate:** `a40c613757e7400aa69ac515cc0933dc84821703`  
**Live URL:** <https://presence-bridge.sociobot.in>  
**Verified:** 2026-08-30 UTC

## Decision

**PASS.** `npm run verify:candidate -- a40c613757e7400aa69ac515cc0933dc84821703` confirmed the supplied full SHA is reachable. This is a documentation-only commit atop release source `b78ad7c` (`v0.1.21`); a fresh production build was compared with live and all **24 publicly served artifacts** matched SHA-256 byte-for-byte (the unserved Static Web Apps configuration file was excluded).

Defects: **P0 0 · P1 0 · P2 0 · P3 0**.

## Mandatory gates

- `.factory/claims.json` exists with 26 entries. After `npm ci`, every declared command was run literally: all 26 passed in desktop Chromium and the 390 × 844 project, using shipped demo data.
- Cold live first read passed at desktop and 390 px. It says what it does (**“See who is free before you message”**), who it is for (small teams needing availability without moving chat), and what to click (**“Try it with sample data”**, with the immediate result stated). One click shows four named teammates and the persistent isolated-demo banner with Reset demo and Start for real.
- `npm run lint`, `npm run audit:copy`, `npm test` (15 Vitest tests; 94 Playwright tests), `npm run build`, and `npm audit --audit-level=high` passed. The Vite build writes `dist/site/`.
- After installing the exact Linux packages declared in the release workflow, `cargo fmt --check`, locked `cargo check`, locked `cargo test`, and warnings-denied `cargo clippy` passed. Native test `shared_folder_reads_only_bounded_presence_files` passed.

## Independent live evidence

- Cold desktop and 390 px browser visits had no console/page errors. Initial requests were exclusively same-origin product assets; no tracker or third-party font/script was loaded.
- Demo flows preserve local separation: the declared privacy, activity, no-message-transport, calendar, contact-handoff, demo-reset/exit, offline, sharing, recovery, and limit checks all passed from fresh browser contexts. No sign-in, app backend, or runtime AI feature applies.
- Response headers include HSTS, `nosniff`, strict-origin referrer policy, a restrictive CSP with `frame-ancestors 'none'`, and camera/microphone/geolocation disabled. HTML caches for 30 seconds; hashed assets cache immutable for one year; `sw.js` is `no-cache`.
- Build budget passes: JavaScript is 43,982 B raw (about 15.9 KB gzip), CSS 19,488 B raw (5.3 KB gzip), and the mobile hero 30,482 B. Initial static JS is well below the 200 KB limit.
- The integrated Axe checks in the full suite found no serious or critical findings on all public routes in both viewport projects. The suite also covers keyboard search/navigation, dialog focus return, visible focus, 44 px mobile targets, 200% text, reduced motion, offline reload, and service-worker replacement.

No product code was modified during verification.
