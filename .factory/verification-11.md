# Independent verification 11 — PASS

**Candidate:** `9ff3ae4d40755f0624f5707a580ca7eea5c347c4` (`main`)  
**Live URL:** <https://presence-bridge.sociobot.in>  
**Verified:** 2026-08-29–30 UTC from the supplied clean checkout

## Decision

**PASS.** The smallest useful product works end to end, the deployed static files match a fresh build of the candidate, the published desktop release installs and exercises its native contact opener, and no release-blocking defect was found.

Defects by severity: **P0: 0 · P1: 0 · P2: 0 · P3: 0**.

## Mandatory first-read and demo gate

A cold desktop and 390 × 844 live visit answers all three required questions in the first screen:

- What: **“See who is free before you message.”**
- Who: **“For small teams that need availability without moving every conversation into another chat app.”**
- First click: **“Try it with sample data,”** beside **“See four sample teammates and your status in one click.”**

The action starts at y=423 px and is 46.8 px high on the 390 px viewport. One click opens four named teammates and the visitor's status. The persistent banner says **“Demo — sample data, nothing is saved”** and offers **Reset demo** and **Start for real**. This gate passes.

## Claims gate

`.factory/claims.json` exists and contains 24 entries. I invoked every listed command before any broader product testing. The literal pre-install attempt stopped at the shared prerequisite `vitest: not found`; no claim assertion ran. I then performed the required clean lockfile install (`npm ci`) and reran every exact command. All 24 claim tests executed and passed in desktop Chromium and the 390 px project:

| Claim | Exact command | Result |
| --- | --- | --- |
| `contact-handoff` | `npm test -- --grep @claim:contact-handoff` | PASS |
| `privacy-local` | `npm test -- --grep @claim:privacy-local` | PASS |
| `transparent-presence` | `npm test -- --grep @claim:transparent-presence` | PASS |
| `no-message-transport` | `npm test -- --grep @claim:no-message-transport` | PASS |
| `calendar-local` | `npm test -- --grep @claim:calendar-local` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `free-limit` | `npm test -- --grep @claim:free-limit` | PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `demo-exit-discard` | `npm test -- --grep @claim:demo-exit-discard` | PASS |
| `demo-seed-and-first-view` | `npm test -- --grep @claim:demo-seed-and-first-view` | PASS |
| `paid-roster` | `npm test -- --grep @claim:paid-roster` | PASS |
| `checkout-availability` | `npm test -- --grep @claim:checkout-availability` | PASS |
| `license-minimization` | `npm test -- --grep @claim:license-minimization` | PASS |
| `json-backup` | `npm test -- --grep @claim:json-backup` | PASS |
| `shared-presence` | `npm test -- --grep @claim:shared-presence` | PASS |
| `shared-folder-refresh` | `npm test -- --grep @claim:shared-folder-refresh` | PASS |
| `release-platforms` | `npm test -- --grep @claim:release-platforms` | PASS |
| `signing-configuration` | `npm test -- --grep @claim:signing-configuration` | PASS |
| `no-payment-runtime` | `npm test -- --grep @claim:no-payment-runtime` | PASS |
| `platform-download` | `npm test -- --grep @claim:platform-download` | PASS |
| `release-checksums` | `npm test -- --grep @claim:release-checksums` | PASS |
| `release-fallback` | `npm test -- --grep @claim:release-fallback` | PASS |
| `linux-installer` | `npm test -- --grep @claim:linux-installer` | PASS |
| `windows-installer` | `npm test -- --grep @claim:windows-installer` | PASS |

The claims contract test also confirms exactly one tagged browser test per claim. The generated copy audit matches the rendered landing page and README, has no sentence over 22 words, and reports no banned marketing term. I found no unlisted material product claim.

## Clean checkout gates

- `npm ci`: PASS; 66 packages added, 67 audited, 0 vulnerabilities.
- `npm test`: PASS; 14 Vitest assertions and 88 Playwright assertions passed. The two skips are mobile-only assertions skipped in the desktop project and both pass in the mobile project.
- `PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npm test`: PASS with the same 14 + 88 results against production.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run audit:copy`: PASS in desktop and mobile projects.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- `npm run build`: PASS; exact Vite production output created `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after installing the documented Linux Tauri prerequisites.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: PASS; the native bounded-folder test passed.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.

The first native compilation attempt correctly reported missing host `glib-2.0` metadata. Installing the same Ubuntu packages declared in the release workflow resolved the environment prerequisite; no source change was needed.

## End-to-end product behavior

Representative normal flows passed locally and live: load the four-person sample, change manual presence, import an active `.ics` event, search/select with keyboard, open saved Slack/Teams/Meet/email links, add the fifth free person, download/parse a JSON backup, explicitly export/import a presence update between isolated rosters, and restore a valid-license fixture for ten people and two contact tools.

Boundary and recovery paths passed: a sixth free person is rejected without corrupting the five-person roster; malformed and legacy-invalid backups fail closed; `javascript:` and `ftp:` contact links are rejected with a specific inline recovery message, preserved form values, `aria-invalid`, and focus on the field; unavailable checkout metadata produces a calm no-purchase state; Reset, Start for real, Back, and context close restore or discard demo state as promised. Calendar-derived presence changes at the event boundary without a reload.

The native shared-folder reader considers at most 200 entries, ignores non-`.presence.json` files and files over 1 MiB, imports only newer updates, marks day-old updates stale, and removes its saved grant when stopped. This is covered by the browser fixture and native Rust test.

## Privacy, network, and headers

An independent Playwright run performed the live first click, manual status change, keyboard/pointer activity, settings save, active-calendar import, and Slack handoff at desktop and mobile sizes. Each run recorded 12 requests, all to `https://presence-bridge.sociobot.in`; there were no analytics, calendar upload, roster upload, or contact-tool network requests. `sessionStorage[demo:presence-bridge:v1]` existed while `localStorage[presence-bridge:v1]` stayed `null`. The handoff reported **“Opening Slack for Ava Shah.”** without carrying a message.

Live HTML responses include CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and disabled camera, microphone, and geolocation. The CSP limits connections to self, GitHub release metadata, and the Sociobot billing API. HTML uses `public, must-revalidate, max-age=30`; `sw.js` uses `no-cache`; hashed assets use `public, max-age=31536000, immutable`. The missing-page response is a styled HTTP 404.

The external Sociobot license endpoint enforced its documented client allowance: requests 1–30 returned 200 for an invalid fixture token, request 31 returned **429**, and that response included **`Retry-After: 2`**. The observed allowance was 30 requests in the active window.

## Accessibility and responsive behavior

- The repository Axe integration found zero serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404 in both projects.
- `/opt/fleet/lib/verify-url.sh` passed live home, demo, and app: HTTP 200, `lang=en`, distinct title, one `h1`, one `main`, complete image alternatives and button names, and no unexpected console/page error.
- The live 390 px flow had no horizontal overflow. The full suite checked every visible target across routes, dialogs, dynamic download links, and the app footer at a minimum 44 × 44 CSS px.
- Eight consecutive live keyboard Tab stops displayed a 3 px `rgb(255, 241, 180)` focus outline. `/` focuses roster search, Arrow Down changes the selected teammate, Enter opens its preferred contact tool, and Escape closes dialogs and returns focus.
- At 200% text size every tested route remains within the viewport. `prefers-reduced-motion: reduce` removes the trail and transition motion.
- There were no unexpected console or page errors in the independent desktop/mobile flows or Lighthouse run.

## PWA, performance, and bundle budgets

A fresh service-worker context registered an old build, activated a new build, removed the old cache, then reloaded `/demo` offline with Ava Shah visible. The normal offline-reload claim also passed against production. The live cache name was `presence-bridge-0.1.18-9ff3ae4d4075`, tying the deployed shell to this candidate.

Fresh mobile Lighthouse: **Performance 94, Accessibility 100, Best Practices 100, SEO 100**; FCP 977 ms, LCP 1,198 ms, TBT 289.5 ms, CLS 0, total transfer 149,390 bytes. A ten-sample status-change-to-second-paint probe measured 34 ms median and 185 ms maximum.

The complete emitted JavaScript is 44,042 bytes raw / 15,894 bytes gzip, CSS is 19,488 bytes raw / 5,316 bytes gzip, fonts are 0 bytes, and the 390 px hero is 30,482 bytes. All stated budgets pass.

## Deployment and desktop release identity

Fresh build versus live comparison covered all 24 publicly served output files; every SHA-256 matched. The service-worker build/cache identity contains candidate prefix `9ff3ae4d4075`. The only file excluded is `staticwebapp.config.json`, which is host configuration rather than a public asset.

Release `v0.1.18` targets `16aff877e2b476fe9278cdde31638cb952aa791a`. Candidate `9ff3ae4d…` is a later documentation/evidence-only commit: its diff after `16aff877…` changes only `.factory/**`, so the release source and candidate have identical product, installer, and workflow content. `latest.json` records that release source commit. The release publishes macOS universal DMG/app archive, Windows MSI/EXE, Linux AppImage/deb/rpm, `SHA256SUMS`, and `latest.json`. All macOS, Windows, Linux, manifest, Windows installer smoke, and Linux installer smoke jobs succeeded.

A fresh live `install.sh` run installed the v0.1.18 AppImage into an isolated temporary `XDG_BIN_HOME`. Its SHA-256 was `f36cf494b4a5f4c152393b4663c146d0801d83355ea4c8bf0ae38e38c08ab91f`, exactly matching `SHA256SUMS`. The packaged Tauri process then passed `--smoke-opener` under Xvfb for `slack:`, `msteams:`, `https:`, `mailto:`, `zoommtg:`, and `tel:`. The live download page detected Linux and linked that AppImage, the checksum file, and `latest.json` with no console error. Every discovered HTTP link returned its expected 200 after redirects; the intentional missing-page link returned 404.

## Applicability and known limitations

There is no sign-in, product-owned backend, standalone CLI/library, or runtime AI feature, so Entra identity, backend persistence/concurrency/health, consumer-package API, and AI-gateway checks do not apply. macOS and Windows packages remain unsigned unless the owner supplies certificates, and the product states this before download. Bridge Plus checkout is not registered; the product clearly marks it unavailable and exposes no dead purchase link. Neither is a candidate defect.

No product code was modified during verification.
