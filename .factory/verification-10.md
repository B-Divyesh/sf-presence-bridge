# Independent verification 10 — PASS

**Candidate:** `3bcd3e50d23963398d0f416f3e7450a4b79fc1dc` (`v0.1.17`)

**Live URL:** https://presence-bridge.sociobot.in

**Verified:** 2026-08-29 from a clean checkout

## Decision

**PASS.** The deployed static product is byte-for-byte the fresh production build of the requested commit, the tagged desktop release targets that same commit, and the small-team presence-and-contact-handoff job works in the web demo and the published Linux desktop package. No release-blocking defects were found.

## First read and one-click demo — PASS

A cold live visit says **“See who is free before you message.”** It says this is **for small teams** that need availability without moving conversations into another chat app. The visible first action is **“Try it with sample data”**, with the adjacent explanation **“See a five-person roster in one click.”** One click opens the seeded roster. The persistent banner says **“Demo — sample data, nothing is saved”** and includes **Reset demo** and **Start for real**.

## Claims gate — PASS

`.factory/claims.json` exists and contains 19 claims. After `npm ci`, every declared `npm test -- --grep @claim:<id>` command was run from the demo-capable product entry point. The following all passed in desktop Chromium and the 390 px mobile project:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `demo-exit-discard`, `paid-roster`, `checkout-availability`, `license-minimization`, `json-backup`, `shared-presence`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, and `windows-installer`.

The complete clean suite subsequently passed: 13 Vitest assertions and 76 Playwright assertions passed; two desktop-only mobile assertions were intentionally skipped. One earlier concurrent run experienced a Chromium SIGSEGV while creating the mobile `release-checksums` context; its assertion did not execute. The exact claim passed alone immediately afterward, and the complete suite passed when native and browser stress checks were not run concurrently. This was treated as a runner event, not a product failure.

## Build and desktop validation — PASS

- `npm ci`: passed; 67 packages audited, no vulnerabilities.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and emitted `dist/site/`.
- `npm test`: passed: 76 Playwright passed, 2 intentional skips; 13 Vitest passed.
- `npm audit --audit-level=high`: passed; 0 vulnerabilities.
- After installing the Linux packages declared by the release workflow, `cargo fmt --check`, `cargo check --locked`, and `cargo test --locked` all passed. Rust has no unit/doc cases at present.
- GitHub release `v0.1.17` targets `3bcd3e50d23963398d0f416f3e7450a4b79fc1dc` and publishes macOS, Windows, Linux AppImage/deb/rpm, `SHA256SUMS`, and `latest.json`.
- A freshly downloaded `Presence.Bridge_0.1.17_amd64.deb` matches `SHA256SUMS` and declares `presence-bridge` / `0.1.17` / `amd64`.
- A freshly downloaded, checksum-verified AppImage passed `--smoke-opener` under Xvfb. The actual packaged Tauri IPC accepted the six exact saved-link schemes: `slack:`, `msteams:`, `https:`, `mailto:`, `zoommtg:`, and `tel:`.

## End-to-end behavior — PASS

The browser suite exercised the seeded and empty roster, manually selected and calendar-derived status, five- and ten-person boundaries, first and second contact tools, search plus Arrow/Enter roster use, malformed backup/contact recovery, demo reset/exit isolation, local JSON backup, explicit presence-update sharing, valid and invalid license fixtures, offline reload, service-worker replacement, and unavailable checkout fallback. Invalid contact input keeps the form and fields intact, announces a specific recovery message, and focuses the invalid field.

## Live deployment, privacy, security, accessibility, and performance — PASS

- The 23 public files in fresh `dist/site/` match the live files byte-for-byte. `staticwebapp.config.json` correctly remains deployment configuration rather than a public file. The live worker and HTML asset names identify `v0.1.17`.
- A live demo flow at 390 px changed status and imported an ICS file. Its request log contains only same-origin document/assets; no analytics, calendar, roster, presence, message, or third-party request occurred. Demo state is in `sessionStorage[demo:presence-bridge:v1]`; the real `localStorage[presence-bridge:v1]` remained `null`.
- `/opt/fleet/lib/verify-url.sh` passes the live home: HTTP 200, no console/page errors, title, `lang=en`, one `h1`, a `main`, image alt coverage, and labeled buttons.
- The repository Axe scans found zero serious or critical findings on home, demo, privacy, terms, download, standalone app, and 404 at desktop and 390 px. The 390 px suite verifies no horizontal overflow and 44 px targets across routes and dynamic dialogs. Keyboard flow, Escape focus return, invalid-field focus, 200% reflow, reduced motion, and service-worker update/offline behavior pass. A live keyboard focus ring is a visible 3 px solid `rgb(255, 241, 180)` outline.
- Live responses have CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, disabled camera/microphone/geolocation, and a matching `connect-src`. HTML uses `public, must-revalidate, max-age=30`; `sw.js` is `no-cache`; hashed JS has `public, max-age=31536000, immutable`.
- Initial JavaScript is 40.85 KB raw / 14.73 KB gzip; CSS is 19.04 KB raw / 5.21 KB gzip; no web fonts are loaded; the mobile hero is 30.48 KB. All stated static budgets pass.
- The Sociobot license verification endpoint accepted 30 sequential invalid-token requests from one client, then returned **429** on request 31 with **`Retry-After: 4`**.

## Applicability and defects

There is no sign-in, product-owned backend, standalone CLI, or runtime AI feature. The Entra authority check is therefore not applicable. Desktop binaries are intentionally unsigned and the product documents this. No P0, P1, P2, or P3 product defects were found.
