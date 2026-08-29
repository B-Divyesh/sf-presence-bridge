# Independent verification 5 — PASS

**Candidate:** `0edb48814b5a6d35bcf30883b63703d0bcaecbe4`  
**Live URL:** https://presence-bridge.sociobot.in  
**Verified:** 2026-08-29 from a clean checkout

## Decision

**PASS.** Fresh local and live evidence shows that this candidate delivers the brief's local desktop presence roster, manual/calendar-derived availability, local team roster, and one-click handoff to existing tools. The deployment serves the candidate's exact hashed application assets. The former paid-checkout failure is handled honestly: no broken purchase link is exposed while checkout is unavailable.

No product code was changed during this verification. This report and the handoff update are documentation-only changes.

## First read and demo — PASS

A cold live desktop load gave this plain answer within the first screen:

- **What it does:** “See who is free before you message.”
- **For whom:** “For small teams that need availability without moving every conversation into another chat suite.”
- **What to do first:** **Try it with sample data**, followed by “See a five-person roster in one click.”

The visible three facts state local storage, offline operation after first visit, and the free five-person limit. `/demo` opens the realistic four-teammate sample plus the user's own presence, and keeps the required **Demo — sample data, nothing is saved** banner, **Reset demo**, and **Start for real** action.

## Required claims gate — PASS

`.factory/claims.json` is present with 18 entries. After `npm ci`, every exact `test` command in that manifest was invoked from this clean checkout; every command passed in configured Chromium desktop and 390px mobile projects.

| Claim IDs whose exact commands passed |
| --- |
| `contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload` |
| `free-limit`, `demo-isolation`, `paid-roster`, `checkout-availability`, `license-minimization`, `json-backup` |
| `shared-presence`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, `windows-installer` |

This includes observable handoff opening, same-origin-only demo privacy, no activity inference, local ICS parsing, offline reload, free/paid roster boundaries, isolated demo storage, local JSON backup, explicit status sharing, release metadata/fallback, and installer checksum behavior.

## Clean local quality gates — PASS

- `npm ci`: PASS; 67 packages, 0 reported vulnerabilities.
- `CI=1 npm test`: PASS; 9 Vitest tests and Playwright's 68 configured cases (67 passed, 1 intentional project skip).
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS; production site emitted to `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` and `cargo check --locked --manifest-path src-tauri/Cargo.toml`: PASS after installing the documented Linux Tauri development prerequisites in this disposable image.
- `CI=true npm run tauri build`: PASS; produced `src-tauri/target/release/bundle/deb/Presence Bridge_0.1.8_amd64.deb` (4,600,464 bytes) and `.../rpm/Presence Bridge-0.1.8-1.x86_64.rpm` (4,602,050 bytes).
- Static first-load budgets pass: app core JS 25.85 KB raw / 9.14 KB gzip, site JS 11.46 KB raw / 4.53 KB gzip, CSS 17.61 KB raw / 4.96 KB gzip.

The base verifier image exports `CI=1`; current Tauri CLI accepts only boolean `CI=true|false`, so a bare `npm run tauri build` there reports an argument-value error before building. `CI=true npm run tauri build` is the successful production CI form; GitHub Actions supplies a boolean CI environment. This is an environment compatibility note, not a candidate source failure.

## Functional, accessibility, privacy, and PWA evidence — PASS

- Fresh live desktop and 390×844 checks covered `/`, `/demo`, `/app.html`, `/privacy`, `/terms`, and `/download`. Each returned 200, supplied exactly one `h1` and one `main`, had no serious/critical Axe findings, no horizontal overflow, and no console/page error. An unknown route returned a styled real HTTP 404.
- Keyboard-only live checks verified `/` search focus, roster ArrowDown selection, visible 3px light focus outline, and dialog Escape/focus-return behavior. Reduced-motion emulation matched `prefers-reduced-motion`; the shipped regression suite also covers the no-motion treatment and 200% text.
- Normal and recovery flows were exercised in the real app: load sample, add a fifth person, reject a sixth with “The free roster holds five people…”, reject an unsupported contact link through the polite live error, and reject invalid ICS content with “No calendar events were found. Choose a valid .ics export.”
- During a complete live demo flow, changing status to `away`, keyboard input, pointer movement, and invalid-calendar recovery made **no external request**. The chosen `away` status remained unchanged after keyboard/pointer activity. Storage contained only `sessionStorage[demo:presence-bridge:v1]`; real `localStorage` was empty.
- A fresh service-worker context registered `https://presence-bridge.sociobot.in/sw.js?build=0.1.8-0edb48814b5a`; after a normal reload, `/demo` reloaded offline with Ava Shah and the demo banner visible. The local suite additionally passes old-cache retirement/new-worker update coverage.
- Fresh Lighthouse mobile on `/demo`: **92 performance**, **100 accessibility**, LCP **1,106 ms**, CLS **0**, TBT **341 ms**.

## Deployment, release, headers, and rate limit — PASS

- Live `assets/site-CBJI3r3U.js` SHA-256 is `bb784cfb0a45a00cd62ce25f0d9e2549f32c767ec588df5dc9a3acf3dbd1f600`, exactly matching the candidate build. Live `assets/app-core-DTpVT0hW.js` SHA-256 is `1acc70f5035f5a91da07129a10372da15a4769b4d8df18a30e086be5d149e650`, also an exact match.
- Live HTML sends CSP with only self plus documented GitHub/Sociobot connections, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, restrictive camera/microphone/geolocation permissions, and `frame-ancestors 'none'`. Hashed assets are `public, max-age=31536000, immutable`; `sw.js` is `no-cache`; HTML short-revalidates. No CDN fonts/scripts or trackers were requested.
- GitHub release `v0.1.8` includes macOS, Windows, and Linux assets plus valid `SHA256SUMS` and `latest.json`. The downloaded Linux `.deb` verified successfully against its published checksum. The live download page's release metadata request completed without console errors.
- No sign-in is used; the Microsoft Entra External ID requirement is therefore not applicable.
- The only server-side call surface, license verification, enforces its allowance. From this verifier client, 30 sequential invalid-token requests returned 200; request 31 returned **429** with `Retry-After: 2` and `X-RateLimit-After: 2`.

## Defects by severity

None found. No release-blocking defects remain.

## Scope notes

This is a desktop app, not a library, CLI, or standalone backend. Consumer-package and backend concurrency/persistence tests do not apply. The published cross-platform release was independently inspected and checksum-verified; the local Tauri package build verified this Linux environment.
