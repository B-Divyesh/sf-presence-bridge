# Independent verification 9 — FAIL

**Candidate:** `197f7aacfb15119df43ace265a6098c7f29a8360` (`v0.1.13`)

**Live URL:** https://presence-bridge.sociobot.in

**Verified:** 2026-08-29 from the supplied clean clone

## Decision

**FAIL.** The live deployment and published desktop release match the requested candidate, and the web experience is otherwise healthy. However, the desktop artifact cannot open the advertised Slack, Teams, or Zoom links because its Tauri opener capability permits only `mailto:`, `tel:`, `http:`, and `https:` URLs. This breaks the central one-click contact handoff for three advertised tool types. Several mobile links also miss the mandatory 44 × 44 px touch-target floor.

No product code was changed during verification.

## Release-blocking findings

### P1 — The desktop app rejects three advertised contact-tool schemes

The app accepts and advertises six link classes: Slack (`slack:`), Teams (`msteams:`), Meet/HTTPS, email (`mailto:`), Zoom (`zoommtg:`), and phone (`tel:`). In the real Tauri branch, `src/app-core.ts` calls `openUrl(url)`.

The only configured opener permission is `opener:default` in `src-tauri/capabilities/default.json`. Tauri's generated ACL describes that permission as allowing only `mailto:`, `tel:`, `https:`, and `http:` and emits exactly those four URL scope patterns. It does not permit `slack:`, `msteams:`, or `zoommtg:`. Those native handoffs therefore take the caught error path instead of opening the saved app.

The `@claim:contact-handoff` browser test is a false positive for the desktop artifact. It runs without `window.__TAURI_INTERNALS__`, replaces `window.open`, and therefore never exercises the Tauri plugin or its ACL. The test passes all six URLs while bypassing the branch shipped in the desktop app.

Evidence: [`native-opener-scope.json`](evidence/verification-9/native-opener-scope.json), `src/app-core.ts:313-324`, `src-tauri/capabilities/default.json:6`, and `tests/e2e/claims.spec.ts:40-78`.

Required repair: add explicit Tauri opener scopes for the three custom schemes, then add a packaged/native integration test that proves the actual opener command accepts every advertised URL. Browser `window.open` interception alone is insufficient.

### P2 — Mobile link targets are smaller than 44 × 44 px

At a fresh 390 × 844 viewport, measured clickable boxes include:

| Surface | Link | Measured box |
| --- | --- | ---: |
| `/download` | Check SHA256SUMS | 163.8 × 19 px |
| `/download` | Read latest.json | 209.1 × 43.8 px |
| Settings dialog | terms | 37.1 × 15 px |
| Settings dialog | privacy | 45.1 × 15 px |
| `/app.html` footer | Terms | 40 × 44 px |

This violates the attached accessibility and design contracts' unconditional 44 × 44 px minimum. The existing mobile test checks selected nav/footer links but omits the dynamically rendered release-proof links, settings links, and standalone app footer.

Evidence: [`live-touch-targets.json`](evidence/verification-9/live-touch-targets.json), [`live-touch-targets-dynamic.json`](evidence/verification-9/live-touch-targets-dynamic.json), [download screenshot](evidence/verification-9/touch-target-download-mobile.png), and [settings screenshot](evidence/verification-9/touch-target-settings-mobile.png).

Required repair: give each link its own minimum 44 × 44 px hit area and at least 8 px separation, then extend the mobile target-size test to every visible interactive element, including dynamic content and dialogs.

## Mandatory first-read and demo gate — PASS

A cold visit answers all three questions in the first viewport:

- What: **“See who is free before you message.”**
- Who: small teams that need availability without moving conversations to another chat app.
- First action: **“Try it with sample data”**, beside **“See a five-person roster in one click.”**

The action opens the seeded roster in one click. The persistent banner states **“Demo — sample data, nothing is saved”** and provides **Reset demo** and **Start for real**. Evidence: [desktop](evidence/verification-9/live-cold-desktop.png), [390 px reduced-motion view](evidence/verification-9/live-cold-mobile-reduced-motion.png), and [mobile demo flow](evidence/verification-9/live-demo-mobile-flow.png).

## Claims gate

`.factory/claims.json` exists with 19 entries. After `npm ci`, every listed command was run separately and exactly as written. All passed in desktop Chromium and the 390 px mobile project:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `demo-exit-discard`, `paid-roster`, `checkout-availability`, `license-minimization`, `json-backup`, `shared-presence`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, and `windows-installer`.

The `contact-handoff` result does not validate the desktop branch, as described in the P1 finding. Evidence: [`claims-summary.tsv`](evidence/verification-9/claims-summary.tsv) and [`claims.log`](evidence/verification-9/claims.log).

No additional unlisted marketing claim was found in the landing page or README.

## Build and automated gates

- `npm ci`: PASS; 67 packages audited, 0 vulnerabilities.
- `npm test`: PASS; 12 Vitest tests and 76 Playwright tests passed; 2 desktop skips are intentionally mobile-only.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS; exact production output written to `dist/site/`.
- Production-preview Playwright: PASS; 76 passed, 2 intentional skips.
- Live Playwright: PASS; 76 passed, 2 intentional skips.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- Locked `cargo check` and `cargo test`: PASS after installing the Linux Tauri packages declared by the release workflow. Native tests currently contain 0 unit/doc cases.

The first native attempt failed only because the clean worker lacked `glib-2.0.pc`; the same documented Ubuntu prerequisites used by CI resolved it. Evidence: [`quality-gates.log`](evidence/verification-9/quality-gates.log), [`native-after-prereqs.log`](evidence/verification-9/native-after-prereqs.log), [`production-preview-e2e.log`](evidence/verification-9/production-preview-e2e.log), and [`live-e2e.log`](evidence/verification-9/live-e2e.log).

## End-to-end, boundaries, and recovery

Local production preview and live runs covered:

- sample and empty rosters; add/edit/remove flows; five- and ten-person limits;
- status selection, pointer/keyboard activity non-inference, search, Arrow navigation, and Enter handoff;
- active and boundary-ending calendar events;
- valid backups and presence updates across isolated contexts;
- malformed backup/calendar/contact input with state preservation and recovery;
- demo reset/exit isolation and real storage clearing;
- valid/invalid license fixtures and checkout-unavailable behavior;
- all six advertised URLs in the browser branch.

The web flow passed. The native opener scope defect remains because the browser harness cannot exercise Tauri ACL enforcement.

## Privacy, headers, caching, and request allowance

During the live demo flow, Playwright observed only same-origin requests. Demo state used only `sessionStorage[demo:presence-bridge:v1]`; real `localStorage` remained empty. No analytics, roster, status, calendar, activity, or message request left the origin, and no console/page error occurred.

Live responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and disabled camera, microphone, and geolocation. HTML is `public, must-revalidate, max-age=30`; `sw.js` is `no-cache`; hashed assets are `public, max-age=31536000, immutable`.

The Sociobot license verification endpoint allowed 30 sequential invalid-token requests from one client. Request 31 and later returned **429** with `Retry-After: 4`.

Evidence: [`live-browser-audit.json`](evidence/verification-9/live-browser-audit.json), [`license-rate-limit.json`](evidence/verification-9/license-rate-limit.json), and [`headers/`](evidence/verification-9/headers/).

## Accessibility, responsive behavior, and PWA

- Fresh Axe scans of `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the real 404 at desktop and 390 px found zero serious or critical violations.
- Every checked route has `lang=en`, one `h1`, one `main`, the correct title, no horizontal overflow, and no unexpected console/page error.
- Keyboard search, roster navigation, dialogs, Escape focus return, and invalid-field focus pass.
- Visible keyboard focus measured as a 3 px solid high-contrast outline.
- 200% text reflow passes.
- Reduced-motion checks found zero running animations across all routes.
- Service-worker update and offline reload pass. The live worker is `sw.js?build=0.1.13-197f7aacfb15`, with cache `presence-bridge-0.1.13-197f7aacfb15`.
- Factory `verify-url.sh` passes home, demo, app, privacy, terms, and download.

The undersized touch targets remain the accessibility exception.

## Performance and bundle budgets

Fresh mobile Lighthouse: Performance **96**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 997 ms, LCP 1,393 ms, TBT 229 ms, CLS 0, total transfer 133,316 bytes. A ten-sample synthetic click-to-second-paint check measured 20 ms median and 29.6 ms maximum; field INP is unavailable in a fresh lab run.

Initial home JS is 40,324 bytes raw / 14,318 bytes gzip, CSS is 18,845 bytes raw / 5,190 bytes gzip, fonts are 0 bytes, and the mobile hero is 30,482 bytes. All artifact budgets pass.

Evidence: [`lighthouse-mobile.json`](evidence/verification-9/lighthouse-mobile.json), [`bundle-budgets.tsv`](evidence/verification-9/bundle-budgets.tsv), and [`live-interaction-latency.json`](evidence/verification-9/live-interaction-latency.json).

## Deployment and desktop release identity

- Local HEAD, `origin/main`, and tag `v0.1.13` point to the requested candidate.
- The live worker build ID contains `0.1.13-197f7aacfb15`.
- All 23 publicly served production files match the fresh local build byte-for-byte. `staticwebapp.config.json` is deployment configuration and is correctly not served as a public file; its policies are visible in live headers.
- GitHub release `v0.1.13` targets the full candidate SHA. Its `latest.json` also names that SHA.
- Linux, macOS universal, and Windows assets exist with `SHA256SUMS` and `latest.json`.
- All three platform builds, manifest generation, and Linux/Windows installer smoke jobs completed successfully in Actions run `33269825346`.
- A fresh Debian package download matched its published checksum and reports package/version/architecture `presence-bridge` / `0.1.13` / `amd64`.
- The live Linux installer downloaded and checksum-verified the AppImage. The installed file matched the published SHA-256 and remained running under Xvfb until the 10-second smoke timeout.
- All discovered HTTP links returned 200 after redirects, except the intentional styled 404 self-link.

Evidence: [`live-local-hashes.tsv`](evidence/verification-9/live-local-hashes.tsv), [`release-latest.json`](evidence/verification-9/release-latest.json), [`github-release-jobs.json`](evidence/verification-9/github-release-jobs.json), [`release-deb-checksum.log`](evidence/verification-9/release-deb-checksum.log), [`live-linux-installer.log`](evidence/verification-9/live-linux-installer.log), and [`live-link-crawl.json`](evidence/verification-9/live-link-crawl.json).

## Applicability notes

There is no sign-in, so the Entra authority check is not applicable. There is no product-owned backend, library, or standalone CLI. The external billing verification allowance was tested as required. The product has no runtime AI feature. Desktop packages remain intentionally unsigned and disclose that fact.
