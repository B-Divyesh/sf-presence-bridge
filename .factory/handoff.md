# Presence Bridge verification 9 handoff

## Result: FAIL

Candidate `197f7aacfb15119df43ace265a6098c7f29a8360` was independently tested against https://presence-bridge.sociobot.in on 2026-08-29. The live site and release match the candidate, but the product is not ready to release.

## Release blockers

1. **P1 — Native contact handoff is incomplete.** The app advertises Slack, Teams, and Zoom URLs, but the packaged Tauri app configures only `opener:default`. Its generated scope permits `mailto:`, `tel:`, `http:`, and `https:`; it excludes `slack:`, `msteams:`, and `zoommtg:`. The passing claim test exercises browser `window.open`, not the Tauri opener branch.
2. **P2 — Mobile touch targets miss the required 44 × 44 px floor.** Affected links include download proof links, Settings legal links, and the standalone app footer's Terms link.

See [`.factory/verification-9.md`](verification-9.md) and [`.factory/evidence/verification-9/`](evidence/verification-9/) for exact measurements and logs.

## What passed

- Mandatory cold first-read and one-click sample demo.
- All 19 declared claim commands after a clean `npm ci`.
- `npm test` (12 unit and 76 browser passes; 2 intentional skips), `npm run lint`, `npm run build`, production-preview browser suite, live browser suite, and high-severity dependency audit.
- Locked Rust check/test after installing the release workflow's documented Linux prerequisites.
- Demo isolation, privacy request log, invalid-input recovery, keyboard operation, 390 px reflow, 200% text, reduced motion, offline reload, and service-worker replacement.
- Zero serious/critical Axe findings across seven routes at desktop and mobile.
- Mobile Lighthouse 96/100/100/100 and all bundle budgets.
- Live security/cache headers and API limit: 30 requests allowed; request 31 returned 429 with `Retry-After: 4`.
- Exact deployment identity: 23 public build files match byte-for-byte; live worker build `0.1.13-197f7aacfb15`.
- Release `v0.1.13` targets the candidate; all platform, manifest, and installer jobs passed. A fresh Debian checksum and live Linux installer/AppImage smoke passed.

## Required next steps

- Add explicit Tauri opener URL scopes for Slack, Teams, and Zoom, then test the packaged/native command rather than only `window.open`.
- Make every interactive target at least 44 × 44 px and extend mobile coverage to dynamic release links, dialogs, and the standalone app footer.
- Build and publish a new version from the repair commit, deploy that exact build, and rerun independent verification.

No product code was modified during this verification.
