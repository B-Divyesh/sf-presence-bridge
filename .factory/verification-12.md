# Independent verification 12 — FAIL

**Requested candidate:** `57d6a7d77b6a886000198128178f8b2c90c07855`  
**Supplied checkout / current `origin/main`:** `57d6a784584d76f26b6b0f66bdd9b6b5e081d527`  
**Published desktop release source:** `3a1c0740362341ae7115d3533a1b60276f9e8572` (`v0.1.19`)  
**Live URL:** <https://presence-bridge.sociobot.in>  
**Verified:** 2026-08-30 UTC

## Decision

**FAIL.** The exact candidate commit does not exist in the supplied clone or the GitHub repository, so the mandatory candidate-to-deployment identity check cannot pass. GitHub rejected an exact fetch with `upload-pack: not our ref`; its commits API returned HTTP 422, `No commit found for SHA`; and `git cat-file` found no local object. Current `origin/main` is the similar but different SHA `57d6a784…`. The deployed site and desktop release are healthy, but neither can be proven to be candidate `57d6a7d77…`.

Defects by severity: **P0: 0 · P1: 1 · P2: 0 · P3: 0**.

### P1 — requested candidate is unavailable and cannot match production

The acceptance contract requires testing commit `57d6a7d77b6a886000198128178f8b2c90c07855` and confirming that production matches it. That object is absent. The supplied clean checkout and `origin/main` both resolve to `57d6a784584d76f26b6b0f66bdd9b6b5e081d527`. GitHub release `v0.1.19` and its `latest.json` identify `3a1c0740362341ae7115d3533a1b60276f9e8572`. A fresh build of the supplied checkout has 24/24 publicly served files byte-for-byte equal to live, but this does not establish identity with the requested, nonexistent object.

Release only after supplying a reachable candidate SHA and deploying that exact revision, or correcting the work order to the intended reachable SHA and rerunning verification.

## Mandatory first-read and demo gate — PASS

A cold live visit at desktop and 390 × 844 answers all three questions in the first screen:

- What: **“See who is free before you message.”**
- Who: **“For small teams that need availability without moving every conversation into another chat app.”**
- First click: **“Try it with sample data,”** beside **“See four sample teammates and your status in one click.”**

One click opens Ava Shah, Leo Martin, Noor Okafor, and Mina Park plus the visitor's status. The persistent banner says **“Demo — sample data, nothing is saved”** and provides **Reset demo** and **Start for real**. The first-read gate passes at both sizes.

## Claims gate — PASS on the supplied checkout

`.factory/claims.json` exists with 26 entries. The literal pre-install attempt reached the shared missing-dependency prerequisite (`vitest: not found`), so no claim assertion ran in that attempt. After the required clean `npm ci`, every listed command was rerun exactly. All 26 claims passed in both desktop Chromium and the 390 px project:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `demo-exit-discard`, `demo-seed-and-first-view`, `paid-roster`, `checkout-availability`, `license-minimization`, `license-restore`, `status-note`, `json-backup`, `shared-presence`, `shared-folder-refresh`, `release-platforms`, `signing-configuration`, `no-payment-runtime`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, and `windows-installer`.

The same claims plus three recovery scenarios passed against production: **58/58** Playwright cases. The claims-contract unit test confirms one unique tag per registry entry. The generated copy audit matches the landing page and README, has no sentence over 22 words, and reports no banned marketing term. No unlisted material product claim was found.

## Clean-checkout quality gates

- `npm ci`: PASS; 66 packages installed, 67 audited, zero vulnerabilities.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run audit:copy`: PASS; two browser projects.
- `npm test`: PASS on clean rerun; 14 Vitest assertions and 92 Playwright tests passed, with two intentional desktop skips whose mobile forms passed.
- One earlier full-suite attempt ended with a Chromium SIGSEGV while creating the mobile `release-checksums` context. That exact claim had already passed in its isolated command and passed again in the clean full rerun and live suite. No application assertion failed.
- `npm run build`: PASS; the exact Vite production build emitted `dist/site/`.
- `npm audit --audit-level=high`: PASS; zero vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo check --manifest-path src-tauri/Cargo.toml --locked`: PASS.
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: PASS, including `shared_folder_reads_only_bounded_presence_files`.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`: PASS.

The clean container initially lacked `glib-2.0` metadata. Installing the Ubuntu Tauri prerequisites declared by the release workflow resolved that host dependency without changing source.

## End-to-end, boundary, and recovery behavior

The browser and live runs covered the four-person sample and empty real roster; manual and calendar-derived status; saved status notes; search and Arrow-key selection; Slack, Teams, Meet, email, Zoom, and phone handoffs; JSON backup; explicit presence-update sharing; shared-folder refresh; license restore fixtures; five- and ten-person limits; one- and two-contact-tool limits; and demo reset, exit, and close isolation.

Representative recovery cases passed. A malformed `.ics` file reports **“No calendar events were found. Choose a valid .ics export.”** and a valid active event then imports. A sixth free-roster person is rejected while the five saved people remain. Malformed and legacy-invalid backups fail closed. Unsupported contact links preserve the form, explain the allowed schemes, set `aria-invalid`, and focus the field. A calendar-derived busy state changes at its end boundary without reload.

The independent live mobile flow downloaded and parsed a four-person JSON backup, reset back to four sample people, and reloaded offline with Ava Shah visible. In the real roster, Slack opened the exact saved URL `slack://user?team=T123&id=U100` with `_blank` and `noopener,noreferrer`.

## Privacy, requests, security, caching, and rate limiting

The complete independent live demo flow recorded 20 requests, all to `https://presence-bridge.sociobot.in`. There were no analytics, calendar upload, roster upload, activity, message, or contact-tool network requests. Demo state existed only in `sessionStorage[demo:presence-bridge:v1]`; the real roster and license keys remained absent. No console or page error occurred.

Live HTML responses have CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and camera, microphone, and geolocation disabled. HTML uses `public, must-revalidate, max-age=30`; hashed assets use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`. `/missing-page` returns the styled page with HTTP 404.

The Sociobot license verification endpoint enforced an allowance of **30 requests per client in the active window**. Fresh sequential invalid-token requests 1–30 returned 200. Request 31 returned **429** with **`Retry-After: 3`**.

## Accessibility, responsive behavior, and PWA

- The live accessibility suite passed 32 checks with the two expected desktop skips. Axe found zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404 at both viewport sizes.
- The factory `verify-url.sh` passed every 200 route: title, `lang=en`, one `h1`, one `main`, complete image alternatives and button names, and no console/page errors.
- All tested mobile controls and dynamic dialog/download targets are at least 44 × 44 CSS px; all tested routes reflow at 200% without horizontal loss.
- Keyboard `/` focuses search, Arrow Down selects Leo Martin, Escape restores dialog trigger focus, and Tab displays a 3 px solid `rgb(255, 241, 180)` focus outline.
- With reduced motion requested, there were zero running animations, the trail duration was effectively instant, and scroll behavior was `auto`.
- A fresh worker-update test retired the old cache, installed the new cache, and reloaded the sample offline.
- The crawl found 18 successful HTTP targets, two expected `mailto:` links, and only the intentional styled 404.

## Performance and bundle budgets

Fresh mobile Lighthouse: **Performance 100, Accessibility 100, Best Practices 100, SEO 100**. FCP was 1,053 ms, LCP 1,131 ms, TBT 48.5 ms, CLS 0, maximum potential FID 147 ms, and total transfer 97,444 bytes.

The complete emitted JavaScript is 43,982 bytes raw and approximately 15.9 KB gzip. CSS is 19,488 bytes raw / 5,316 bytes gzip. The mobile hero is 30,482 bytes. No font files are shipped. All budgets pass.

## Deployment and desktop release evidence

All 24 publicly served files from a fresh build of reachable checkout `57d6a784…` match live SHA-256 byte-for-byte. `staticwebapp.config.json` is correctly consumed as host configuration and is not served. This demonstrates what is deployed, but not that it equals requested candidate `57d6a7d77…`.

Release `v0.1.19` publishes macOS universal DMG/app archive, Windows MSI/EXE, and Linux AppImage/deb/rpm, plus `SHA256SUMS` and `latest.json`. All six release jobs passed. A fresh Debian download matched its published checksum and reports `presence-bridge` / `0.1.19` / `amd64`.

The live Linux installer independently downloaded and checksum-verified the AppImage (`1c9aec156bd7a270c557be9ad40424237adeaec8ced8a3a63ad4b759ca86bd6b`). Its packaged Tauri smoke accepted all six native schemes: `slack:`, `msteams:`, `https:`, `mailto:`, `zoommtg:`, and `tel:`.

## Applicability

There is no sign-in, product-owned backend, library, standalone CLI, or runtime AI feature. Entra authority, backend concurrency/persistence/health, consumer-package API, and AI-gateway checks do not apply. macOS and Windows builds are intentionally unsigned unless owner certificates are configured, and the download page discloses this. Bridge Plus checkout is intentionally unavailable and no purchase link is shown.

No product code was modified during verification.
