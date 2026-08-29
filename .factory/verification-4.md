# Independent verification 4 — FAIL

**Candidate:** `c17906f3f80fec75b29483dad04a9c63e3dac325`  
**Live URL:** https://presence-bridge.sociobot.in  
**Verified:** 2026-08-29 from a clean checkout

## Decision

**FAIL.** The local-first roster, demo, privacy boundary, desktop release assets, accessibility, responsive layout, offline reload, and rate limit all passed fresh verification. The advertised paid **Bridge Plus** purchase does not work in production: its required Sociobot checkout endpoint returns HTTP 404 instead of redirecting to checkout. This leaves the displayed `$24 once` upgrade impossible to buy and is a release blocker.

No product code was changed during this verification. This report and the handoff update are documentation-only changes.

## Release-blocking finding

### P1 — Bridge Plus checkout is unavailable

Fresh request on 2026-08-29:

```text
GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The live landing page exposes **Buy Bridge Plus** for `$24 once` and links it to exactly that endpoint. The product therefore advertises an upgrade that cannot be purchased. The local `@claim:one-time-price` test passes only because it routes this request to a recorded 302 fixture; it is valid fixture coverage but not proof of the real production outcome.

**Required action:** an authorized Sociobot billing operator must enable/configure `presence-bridge` as a public one-time `$24` product with return URL `https://presence-bridge.sociobot.in/`, then independently confirm a real checkout redirect. Repository code and the static deployment cannot fix this external catalog state.

## Required claims gate — PASS

`.factory/claims.json` exists, has 18 entries, and every exact listed command was run after `npm ci` from this clean checkout. Each invoked the product's configured Playwright demo/browser entry point and passed in both Chromium projects (desktop and 390px mobile).

| Claim ID | Exact command result |
| --- | --- |
| `contact-handoff` | `npm test -- --grep @claim:contact-handoff` — PASS |
| `privacy-local` | `npm test -- --grep @claim:privacy-local` — PASS |
| `transparent-presence` | `npm test -- --grep @claim:transparent-presence` — PASS |
| `no-message-transport` | `npm test -- --grep @claim:no-message-transport` — PASS |
| `calendar-local` | `npm test -- --grep @claim:calendar-local` — PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` — PASS |
| `free-limit` | `npm test -- --grep @claim:free-limit` — PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` — PASS |
| `paid-roster` | `npm test -- --grep @claim:paid-roster` — PASS |
| `one-time-price` | `npm test -- --grep @claim:one-time-price` — PASS (recorded checkout fixture; live failure above) |
| `license-minimization` | `npm test -- --grep @claim:license-minimization` — PASS |
| `json-backup` | `npm test -- --grep @claim:json-backup` — PASS |
| `shared-presence` | `npm test -- --grep @claim:shared-presence` — PASS |
| `platform-download` | `npm test -- --grep @claim:platform-download` — PASS |
| `release-checksums` | `npm test -- --grep @claim:release-checksums` — PASS |
| `release-fallback` | `npm test -- --grep @claim:release-fallback` — PASS |
| `linux-installer` | `npm test -- --grep @claim:linux-installer` — PASS |
| `windows-installer` | `npm test -- --grep @claim:windows-installer` — PASS |

## First read and demo — PASS

A cold live desktop page plainly says what it does, who it is for, and what to do:

- **What:** “See who is free before you message.”
- **For whom:** small teams needing availability without another chat suite.
- **First action:** “Try it with sample data,” immediately followed by “See a five-person roster in one click.”

The first screen also shows the local-only, offline, and free-five-person facts. The one-click `/demo` route opens a realistic four-person roster and persistently displays **Demo — sample data, nothing is saved**, **Reset demo**, and **Start for real**.

## Clean local quality gates — PASS

- `npm ci`: PASS; 67 packages audited, 0 vulnerabilities.
- `npm test`: PASS — 9 Vitest unit checks; 67 Playwright checks passed, 1 intentionally skipped desktop-only mobile-layout case; total duration 2.3 minutes.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS; production output created in `dist/site/`.
- Production output: core JS 25.82 KB raw / 9.12 KB gzip, site-route JS 11.34 KB raw / 4.49 KB gzip, CSS 17.45 KB raw / 4.92 KB gzip, largest hero image 99,034 bytes. These are within the stated static budgets.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS. `cargo check --locked --manifest-path src-tauri/Cargo.toml` could not run in this disposable container because its documented Tauri/Linux prerequisite `glib-2.0` development metadata is absent. This is an environment prerequisite, not a source error; release workflow run `33247788428` for the published desktop release completed successfully with the required Linux packages.

## Functional, accessibility, and privacy evidence — PASS

- Fresh live desktop and 390×844 contexts were tested on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and a missing route. Every real route returned 200; the styled missing route returned an actual 404. Each page had `lang=en`, one `h1`, and one `main`; no serious or critical Axe findings; no horizontal overflow; and no console/page errors other than the expected failed-document message for the deliberate 404.
- The full local suite independently covers keyboard roster search/arrow navigation, visible focus, Escape restoring dialog focus, 44px mobile targets, 200% text resize, normal handoff, five-person and ten-person boundaries, malformed backup recovery, invalid input recovery, calendar boundary update, sharing isolation, and service-worker update retirement.
- Fresh live demo exercise on desktop and mobile changed status to `away`, rejected invalid calendar content with “No calendar events were found. Choose a valid .ics export.”, and retained a non-overflowing layout. Requests during the whole demo flow were only to `https://presence-bridge.sociobot.in`; no analytics, third-party fonts, message transport, or model endpoint was observed.
- Cold live landing load also requested only same-origin HTML, JS, CSS, and self-hosted image assets. The browser reported no errors.
- Reduced-motion emulation sets the landing `.light-trail` animation to `none` with `0.01ms` duration.
- A fresh live service-worker context registered `sw.js?build=0.1.6-c17906f3f80f`; after a normal first load, `/demo` reloaded offline with the sample roster and Ava Shah visible. The local regression test also passes the old-cache → new-cache retirement path.

## Deployment, headers, release, and rate-limit evidence — PASS

- Fresh production build hashes exactly match live for `index.html`, `app.html`, `404.html`, `sw.js`, `assets/app-core-8ZIKNckn.js`, `assets/site-CbRZRPja.js`, and `assets/app-core-DwHSGfL2.css`. The live `asset-manifest.json` also matches byte-for-byte. The candidate's only change relative to release commit `c404f93d688360aa21372acd2d7d8bb4d05e6449` is `.factory/handoff.md`; the running product assets are the candidate build.
- Live responses send CSP (`default-src 'self'`; explicit GitHub/Sociobot `connect-src`), HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, `frame-ancestors 'none'`, and a restrictive camera/microphone/geolocation permissions policy. Hashed assets are `public, max-age=31536000, immutable`; `/sw.js` is `no-cache`; HTML is short-revalidated.
- GitHub release `v0.1.6` targets `c404f93d688360aa21372acd2d7d8bb4d05e6449`; its successful workflow run is `33247788428`. It includes macOS, Windows, and Linux packages, `SHA256SUMS`, and valid `latest.json` with all three platform groups. The live download page loads GitHub metadata without a console error.
- Independently downloaded `Presence.Bridge_0.1.6_x64_en-US.msi` SHA-256 was `1e8ffb41ed593a622fa1844513b7d6b8856354809ee432181878a5fb79d694bb`, exactly matching `SHA256SUMS`. The real Linux installer selected the published AppImage, verified it, installed it in an isolated `XDG_BIN_HOME`, and the installed executable returned an AppImage runtime version.
- The documented license verification allowance is enforced. From one client, 35 sequential invalid-token requests produced 30×200 followed by 5×429. The first 429 was request 31 and included `Retry-After: 3` (plus `X-RateLimit-After: 3`).

## Scope notes

No sign-in is used, so the Microsoft Entra External ID requirement is not applicable. This is a desktop app, not a library/CLI/backend; consumer-package and backend persistence/concurrency tests are not applicable. Platform packages were verified from the published GitHub release; they were not rebuilt locally, per the desktop release workflow constraint.
