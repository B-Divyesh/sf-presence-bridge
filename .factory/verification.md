# Independent verification — FAIL

**Candidate:** `f4a3bc2d40c3547b274b9df2fa46ad6635329258` (`main`)  
**Live URL:** https://presence-bridge.sociobot.in  
**Verified:** 2026-08-28 (fresh checkout)

## Decision

**FAIL.** The application itself is functional and the static deployment matches the candidate, but the release does not meet the desktop installer and PWA-update acceptance requirements. Do not approve until the P1 findings below are repaired and independently rechecked.

## Release-blocking findings

### P1 — Windows one-line installer does not install the app

`public/install.ps1` selects the Windows `*.exe` release asset (the NSIS setup executable), downloads it to `%LOCALAPPDATA%\PresenceBridge\PresenceBridge.exe`, verifies its checksum, then only prints `Installed Presence Bridge`. It neither executes the setup program nor installs an app/binary nor adds a command to `PATH` ([install.ps1](/work/repo/public/install.ps1:3), [install.ps1](/work/repo/public/install.ps1:15)). This makes the advertised one-line Windows install flow a false success. The live `/install.ps1` SHA-256 was identical to the candidate: `8a473b7ad112f8f9169ee66a398927aeae68ef1bd99cb3c11d79df53d80cc98b`.

Repair: download and run the signed/unsigned installer with its original name, or distribute a portable executable and add its directory to the user `PATH`; verify the post-install app/command is runnable. Preserve checksum verification before execution.

### P1 — Service-worker cache is not release-versioned

The deployed service worker is byte-identical to the candidate and uses the fixed cache name `presence-bridge-v1` ([sw.js](/work/repo/public/sw.js:1)). Its activate handler only deletes cache names that are *not* that fixed name ([sw.js](/work/repo/public/sw.js:4)). A new deploy cannot create a new cache namespace or reliably retire runtime-cached old responses, so the required service-worker update strategy/versioned cache is absent. A fresh live context reports only `presence-bridge-v1`.

Repair: generate a cache name from the build/release identity, precache the complete shell for that identity, delete prior versioned caches during activation, and add an automated old-version → new-version update test followed by an offline reload.

### P2 — Missing paths return HTTP 200, not a real 404

`https://presence-bridge.sociobot.in/missing-page` renders the styled in-app “Unlit window” screen but returns `HTTP/2 200`. `public/staticwebapp.config.json` has only a navigation fallback; it has no `responseOverrides[404]` configuration. This fails the required real 404 response and makes crawlers treat invalid URLs as valid pages.

Repair: ship a styled `404.html` and configure the static host response override to rewrite it while retaining HTTP 404; test both direct navigation and refresh.

### P2 — Several visitor-facing promises are not represented by a claim test

The required claims cross-check found unlisted claims, despite `.factory/claims.json` existing. Examples include the non-surveillance and no-message-transport statements in [site.ts](/work/repo/src/site.ts:19) and [README.md](/work/repo/README.md:50), and the displayed `$24 once` price in [site.ts](/work/repo/src/site.ts:20). The `privacy-local` network test is valuable but does not assert these exact promises. The claims contract requires every claim-like visitor statement to have an observable demo test or be removed.

Repair: add focused, tagged claim tests (including a pricing fixture/config assertion where appropriate) or remove/narrow the promises.

## Evidence that passed

### First read and demo

Cold desktop and 390px-mobile visits passed the plain-words gate. The first screen says **“See who is free before you message”**, identifies **small teams**, and has the first action **“Try it with sample data”** with the adjacent outcome **“See a five-person roster in one click.”** The mobile first screen also shows the three facts: local roster, offline after first visit, and free for five people. `/demo` displays the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real.

### Required claim commands

Ran from this checkout after `npm ci`, one command for each `.factory/claims.json` entry, all using the configured `/demo` entry point:

| Claim | Exact command | Result |
| --- | --- | --- |
| `contact-handoff` | `npm test -- --grep @claim:contact-handoff` | PASS |
| `privacy-local` | `npm test -- --grep @claim:privacy-local` | PASS |
| `calendar-local` | `npm test -- --grep @claim:calendar-local` | PASS |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `free-limit` | `npm test -- --grep @claim:free-limit` | PASS |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS |
| `paid-roster` | `npm test -- --grep @claim:paid-roster` | PASS |

The full suite then passed: 3 Vitest unit tests and 30 Playwright tests over desktop Chromium and the 390×844 mobile project. The chain proceeded through build and type check, confirming no test failure.

### Build and native checks

- `npm ci`: PASS; audit reported 0 vulnerabilities.
- `npm test`: PASS (3 unit tests; 30 Playwright tests).
- `npm run build`: PASS; `dist/site/` produced.
- `npx tsc --noEmit`: PASS. There is no repository lint script.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo check --manifest-path src-tauri/Cargo.toml`: PASS after installing the same Ubuntu packages named in the release workflow (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`, `librsvg2-dev`, `patchelf`). The initial clean-container failure was solely missing `glib-2.0` development metadata, which the README declares as a prerequisite.

### Live behaviour, privacy, accessibility, and responsive checks

- Exercised the live demo at 390×844: changed own status; tried an invalid calendar file and invalid `ftp:` contact link; observed explanatory recovery messages; exercised the five-person free-limit path, no-results search, demo isolation, calendar import, and contact-handoff report. No console/page errors were observed in the successful flows.
- Browser request capture during the demo saw only `https://presence-bridge.sociobot.in`; the paid-license fixture test separately intercepts the allowed Sociobot billing call.
- Live axe scans found **zero serious or critical** findings on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and `/missing-page`; each had exactly one `h1` and one `main`, with no captured console or page errors.
- Keyboard coverage is present in the suite for `/` search focus and roster arrow navigation. CSS supplies a visible 3px `:focus-visible` ring. Reduced-motion CSS disables the animated trail and makes transitions effectively instant.
- A fresh live service-worker context succeeded at the current offline-reload behaviour: after first load, `/demo` reloaded offline with “Try a complete team roster” and Ava Shah visible. This does not cure the separate update/versioning defect above.

### Deployment, headers, performance, and release evidence

- Candidate production asset hashes exactly match live: `app-core-Dq_oi8LL.js` `4043c7…9bddd`, `index-DK3tJTdg.js` `bbeab3…4d869`, and `app-core-kX6jhXnw.css` `560371…6f100`. Live `sw.js` and `install.ps1` also match candidate bytes. The candidate’s only post-tag change is handoff documentation.
- Live headers include CSP, `X-Content-Type-Options: nosniff`, HSTS, strict-origin referrer policy, and a restrictive permissions policy. Hashed assets use `Cache-Control: public, max-age=31536000, immutable`; `/sw.js` uses `no-cache`.
- Static bundle budgets pass: initial core JS 19,410 B raw / 7,228 B gzip, route JS 10,731 B raw / 4,299 B gzip, and CSS 16,759 B raw / 4,810 B gzip. The largest hero derivative is 99,034 B.
- `/download` made its CORS-enabled GitHub API request without console errors and selected the Linux AppImage. Release `v0.1.2` contains macOS, Windows, and Linux assets, `latest.json`, and `SHA256SUMS`. The downloaded Windows setup EXE SHA-256 was `48e4d83b12b0f88933d38fe97495d1e87f3194260440da4150b6441a5fbc48b2`, equal to its published checksum.
- Rate-limit check against the product license verification endpoint: a 40-request burst at concurrency 10 returned 30×200 and 10×429. The first request-order 429 was request 29 (concurrency makes an exact serial threshold indeterminate); every 429 included `Retry-After` of 2 or 3 seconds.

## Scope notes

No product code was modified. This report and the handoff update are the only repository changes from verification. Desktop binaries were not rebuilt locally, in accordance with the desktop release instruction; the shipped release assets and checksum were independently verified.
