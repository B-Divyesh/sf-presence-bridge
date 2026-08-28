# Independent verification 2 — FAIL

**Candidate:** `a259ad2106b6cccc7464b72bb8c702c7310d5f6a` (`main`)  
**Live URL:** https://presence-bridge.sociobot.in  
**Verified:** 2026-08-28 from a clean checkout

## Decision

**FAIL.** The repaired deployment, release artifacts, local build, automated suite, demo, privacy boundary, offline update path, and static quality gates are healthy. The candidate is not releasable because its paid checkout is dead, its advertised Linux one-line installer cannot discover the published AppImage, and it does not carry a person's presence to any teammate. The claims manifest also reports success without testing some of those promised outcomes. Mobile overflow and modal-focus defects independently miss the acceptance baseline.

No product code was changed during verification.

## Release-blocking findings

### P1 — The advertised $24 purchase cannot be completed

The live **Buy Bridge Plus** action points to the required Sociobot endpoint, but a fresh request returned:

```text
GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

This leaves the paid tier impossible to buy. It also demonstrates that `@claim:one-time-price` is a false-positive claim test: the test checks displayed copy and the link's `href`, but never exercises checkout or observes a $24 purchase response.

Repair: enable the product in the live Sociobot billing catalog, verify the configured price and return URL, then make the claim test exercise a recorded checkout fixture that proves the outcome rather than the presence of a link.

### P1 — The Linux one-line installer always fails against the current GitHub API response

A clean, isolated invocation of the documented installer failed before downloading anything:

```text
qa_install_dir=$(mktemp -d)
XDG_BIN_HOME="$qa_install_dir" sh public/install.sh
No Linux AppImage is published yet.
```

Release `v0.1.5` does contain `Presence.Bridge_0.1.5_amd64.AppImage` (79,092,216 bytes). GitHub currently serves minified JSON with `"browser_download_url":"..."`; `public/install.sh` searches for the formatting-dependent token `"browser_download_url": "..."`. The live and candidate scripts have the same SHA-256, `e549247b76b9b71b14e1554b16a7a887fd9288f366d1a927eda976110ea523fb`.

Repair: parse the API response as JSON, not with whitespace-sensitive `sed`, and add a clean Linux installer smoke job that verifies checksum, installed path, and executable startup.

### P1 — Presence never reaches another team member

The real job is to let a small team see who is free before messaging. In this build, changing **Your presence** or importing a calendar only writes the browser/device-local `presence-bridge:v1` record. Teammate status rows are separate records edited by the viewer. There is no roster/presence exchange, shared file watch, LAN transport, or relay; the only runtime `fetch` calls are license verification and GitHub release metadata. A fresh browser/device therefore cannot observe another person's chosen or calendar-derived status.

This is not merely the optional encrypted multi-device relay being absent: there is no end-to-end mechanism of any kind by which one teammate's presence becomes visible to another. The product currently behaves as a private, manually maintained address book with sample presence labels.

Repair: define and implement an opt-in sharing boundary consistent with the brief (for example, a local shared roster mechanism plus optional encrypted relay), then prove two isolated clients can publish and observe a status change without message-content transfer or activity inference.

### P1 — The claims inventory does not prove all visitor-facing promises

All 12 listed commands pass after installation, but the manifest still violates the attached claims contract:

- `one-time-price` only checks copy and an `href`; live checkout is 404.
- `paid-roster` checks that a second-link input appears, but never asserts the promised ten-person limit.
- `contact-handoff` checks a toast in demo mode, not that the saved URL is handed to the installed platform opener.
- The README and download page promise cross-platform release generation, OS-based download selection, packages, and `SHA256SUMS`; these have no entries in `.factory/claims.json`. The broken Linux installer is also unlisted.

The contract requires each claim test to prove the observable result, not the existence of a control, and says an unlisted claim fails review.

## Other findings

### P2 — The 390px download page scrolls horizontally

At a 390×844 viewport, `/download` measured `scrollWidth=451` and `clientWidth=390`. The detected AppImage link is 401.8px wide from x=49 to x=450.8, so its long filename visibly exits the card and viewport. At 200% text size, `/download` expands to 819px and every site route expands to at least 539px because the header navigation does not reflow. This fails the required 390px layout and 200% text-resize checks.

### P2 — Modal focus is not restored

Opening **Add person** correctly focuses the first input. Closing it with Escape rebuilds the application DOM and leaves `document.activeElement` on `<body>` instead of returning focus to **Add person**. The same render pattern affects settings. This loses keyboard position and fails the dialog focus-management baseline.

### P2 — Multiple touch targets are under 44px

At 390px, visible targets below the 44px requirement include header links **Demo** and **Download** at 24.8px high, demo **Start for real** at 21.1px, the in-app wordmark at 34.7px, and footer navigation links at 24.8px. Keyboard focus rings themselves are visible (3px, high contrast), but the touch sizing requirement is unmet.

## First-read and demo gate

**PASS.** On cold desktop and 390px mobile loads, the entire mandatory message is visible in the first viewport:

- What: **“See who is free before you message.”**
- For whom: **“For small teams that need availability…”**
- First click: **“Try it with sample data.”**
- Adjacent result: **“See a five-person roster in one click.”**

The three privacy/offline/free facts are visible. `/demo` opens in one click with four realistic colleagues, the persistent **Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start for real**. Demo changes stayed in `sessionStorage`; a real roster remained untouched.

## Claim-test evidence

Per instruction, every `.factory/claims.json` command was invoked before other repository inspection. On the untouched clone, all 12 stopped before assertions because dependencies had not yet been installed (`vitest: not found`). After the required `npm ci`, every exact command passed in the configured desktop and 390px mobile projects:

| Claim | Result |
| --- | --- |
| `contact-handoff` | PASS, 2 browser projects |
| `privacy-local` | PASS, 2 browser projects |
| `transparent-presence` | PASS, 2 browser projects |
| `no-message-transport` | PASS, 2 browser projects |
| `calendar-local` | PASS, 2 browser projects |
| `offline-reload` | PASS, 2 browser projects |
| `free-limit` | PASS, 2 browser projects |
| `demo-isolation` | PASS, 2 browser projects |
| `paid-roster` | PASS, 2 browser projects |
| `one-time-price` | PASS, 2 browser projects; inadequate outcome coverage noted above |
| `license-minimization` | PASS, 2 browser projects |
| `json-backup` | PASS, 2 browser projects |

Each ID appears exactly once in the test sources. The dependency-install precondition is normal for this Node project; the substantive claim assertions all ran and passed after the clean install. Their scope deficiencies remain release-blocking.

## Local quality gates

- `npm ci`: PASS; 67 packages audited, 0 vulnerabilities.
- `npm test`: PASS; 5 Vitest tests and 44 Playwright tests across desktop Chromium and 390×844 mobile.
- `npx tsc --noEmit`: PASS.
- No lint script or lint configuration exists.
- `npm run build`: PASS; exact production output generated under `dist/site/`.
- Production preview: PASS; all 44 Playwright tests passed again against the built output.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after installing the Linux packages declared by the README/release workflow. The initial attempt stopped at missing system `glib-2.0` metadata.
- `git diff --check`: PASS before report edits.

Production sizes: app core JS 19,388 bytes raw / 7.19 KB gzip; route JS 10,674 bytes raw / 4.27 KB gzip; CSS 16,759 bytes raw / 4.80 KB gzip; largest hero image 99,034 bytes. These pass the static budgets.

## Functional, privacy, and recovery evidence

On the live 390px demo, the following paths worked without console or page errors:

- Changed own status and reset the demo.
- Added the fifth free-roster member; the sixth was rejected with the correct five-person limit message.
- Rejected an `ftp:` contact link with a supported-link recovery message.
- Rejected malformed `.ics` and JSON files with actionable messages.
- Recovered from a no-results roster search.
- Loaded the sample project from the real empty state.
- Kept demo and real storage namespaces isolated.

Network capture across the demo flow observed no origin except `https://presence-bridge.sociobot.in`. No analytics, third-party fonts, or runtime Azure/OpenAI calls were present. The live license verifier returned `200 {"expires_at":null,"reason":"invalid","valid":false}` for an invalid token and `Cache-Control: no-store`.

## Accessibility and responsive evidence

- Fresh live axe scans on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404 found zero serious/critical violations at desktop and 390px mobile.
- Each checked route has `lang="en"`, one `h1`, one `main`, and a route-specific title.
- No unexpected console/page errors occurred; direct navigation to the deliberate 404 produced only the browser's expected failed-document console message.
- Keyboard `/`, roster arrow keys, Enter handoff, and visible 3px focus rings worked.
- Reduced-motion CSS collapses animation and transition duration to `0.01ms`; nothing loops.
- The modal focus, 44px targets, 390px `/download` overflow, and 200% resize failures are documented above.

## Offline, headers, caching, and performance

- Live worker identity: `sw.js?build=0.1.5-a259ad2106b6`.
- Live cache identity: `presence-bridge-0.1.5-a259ad2106b6`.
- `/demo` reloaded offline with the roster and Ava Shah visible.
- The local old-worker → new-worker regression test passed and removed the old cache.
- Live HTML uses 30-second revalidation; hashed assets use `public, max-age=31536000, immutable`; `/sw.js` uses `no-cache`.
- Live responses include CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive permissions policy.
- A successful repeat Lighthouse mobile run scored Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.35s, CLS 0, TBT 0ms, total transfer 129,916 bytes. An earlier run ended with a browser-tab crash and was discarded.

## Deployment and desktop-release evidence

The deployment matches this candidate. Local and live SHA-256 values are identical for `index.html`, `app.html`, `404.html`, `sw.js`, both install scripts, app core JS, route JS, and CSS. The live bundle contains build ID `0.1.5-a259ad2106b6`.

Routes `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` return 200. A fresh unknown path returns the designed page with HTTP 404. A crawl found one dead HTTP link: the paid checkout documented above.

Release `v0.1.5` targets commit `e83d09d51fcc1c62cc059e81c22b3528eda220a0` (the product-code parent of this documentation-only candidate). GitHub Actions run `33185352731` is successful and published 2 macOS, 2 Windows, and 3 Linux assets plus `latest.json` and `SHA256SUMS`. An independently downloaded Windows setup matched its published checksum:

```text
Presence.Bridge_0.1.5_x64-setup.exe
expected 6de536a3155635f902f0c2978a96ca6bca99956b153cdeb43807273b3c321ee6
actual   6de536a3155635f902f0c2978a96ca6bca99956b153cdeb43807273b3c321ee6
```

The live download page correctly selected the Linux AppImage through the CORS-enabled GitHub API. That does not cure the separate one-line installer failure.

## API rate limit

A 60-request burst to the live license-verification endpoint at concurrency 12 produced 30×200 and 30×429. The first request-order 429 appeared at index 15 because concurrent responses do not preserve admission order; after 30 total successes, rejection was sustained. Every 429 included `Retry-After: 4`. Rate limiting passes.

## Scope notes

- Sign-in is not required, so the Entra authority requirement is not applicable.
- This is a desktop app, not a library/CLI/backend; clean consumer package checks and backend persistence/concurrency checks are not applicable.
- Platform binaries were not rebuilt locally, consistent with the desktop-release instruction. Release workflow, assets, manifest, checksums, and installer entry points were inspected independently.
