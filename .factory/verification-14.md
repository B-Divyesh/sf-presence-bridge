# Independent verification 14 — PASS

**Candidate:** `139af5f781620c28a3e236ada546ad81101dc135`  
**Live URL:** <https://presence-bridge.sociobot.in>  
**Verified:** 2026-08-30 UTC

## Decision

**PASS.** No P0–P3 defects were found. The requested SHA is present (`npm run verify:candidate -- 139af5f781620c28a3e236ada546ad81101dc135` passed). Its released product-code ancestor is `992682353261f38d2bd3be260dbbba132ea72dbf` (`v0.1.22`); the candidate adds only verification/evidence and handoff material. A fresh build of the candidate matched all 24 publicly served deployment files byte-for-byte.

## Mandatory claim gate

`.factory/claims.json` exists with 26 entries. After `npm ci` (66 packages; audit clean), every declared command was run literally from this checkout against the shipped demo entry point. **26/26 passed**, in both desktop Chromium and the 390 × 844 project:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `demo-exit-discard`, `demo-seed-and-first-view`, `paid-roster`, `checkout-availability`, `license-minimization`, `license-restore`, `status-note`, `json-backup`, `shared-presence`, `shared-folder-refresh`, `release-platforms`, `signing-configuration`, `no-payment-runtime`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, and `windows-installer`.

## First read and live product QA

- Cold desktop and 390px visits plainly say what it does: **“See who is free before you message.”** They identify the audience (small teams needing availability without another chat app) and offer **“Try it with sample data”**, including what happens next. The isolated demo shows four named teammates and the persistent Reset demo / Start for real banner.
- A live demo interaction changed status and a note with only same-origin document, JS, and CSS requests. It created `demo:presence-bridge:v1` in session storage and left `presence-bridge:v1` absent from real storage. No tracker, analytics, payment, or other third-party request occurred.
- Desktop live axe scans for `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the real 404 reported zero serious/critical findings. Console/page errors were empty except the expected browser 404 resource message on the deliberately missing path. `/download` made only its documented GitHub release-metadata request.
- Live keyboard checks passed: `/` focuses roster search, ArrowDown selects Leo Martin, and Escape returns focus to Add person. At 390px, a rejected `javascript:` contact URL preserved entered values, exposed the announced inline recovery text, set `aria-invalid`, and returned focus to the field.
- The live service-worker update/offline test passed. A cold offline reload of `/demo` retained Ava Shah. Reduced-motion was used for the independent browser checks.

## Build and quality checks

- `npm run lint`: passed.
- `npm run audit:copy`: passed (2 Playwright tests).
- `npm test`: passed (15 Vitest tests; 94 Playwright tests; `test-results/.last-run.json` reports `passed`).
- `npm run build`: passed and wrote `dist/site/`.
- `npm audit --audit-level=high`: passed, 0 vulnerabilities.
- After installing the Linux prerequisites declared by the release workflow: `cargo fmt --check`, locked `cargo check`, locked `cargo test` (including `shared_folder_reads_only_bounded_presence_files`), and warnings-denied `cargo clippy` all passed.
- The Linux Tauri packaging run generated `Presence Bridge_0.1.22_amd64.deb` and `Presence Bridge-0.1.22-1.x86_64.rpm`. The disposable harness exports `CI=1`, which this Tauri CLI rejects as a boolean before building; using `CI=true`, matching the production GitHub Actions convention, performs the package build. This is not a release failure: GitHub reports all six v0.1.22 build, manifest, and installer-smoke jobs successful.
- Initial landing JavaScript is 43,420 B raw (15,347 B gzip across the preloaded core and site modules); CSS is 19,488 B raw / 5,309 B gzip. Both are far below the static budgets. Hashed JS/CSS responses are immutable for one year; HTML is short cached and `sw.js` is `no-cache`.

## Deployment and release evidence

- Fresh SHA-256 comparison: **24/24** public files in `dist/site/` matched `https://presence-bridge.sociobot.in` exactly. `staticwebapp.config.json` is not publicly served and was excluded.
- Live headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, a restrictive CSP with `frame-ancestors 'none'`, and a permissions policy disabling camera, microphone, and geolocation.
- GitHub release `v0.1.22` targets `992682353261f38d2bd3be260dbbba132ea72dbf`, has macOS, Windows, and Linux assets plus `SHA256SUMS` and `latest.json`, and all six workflow jobs have conclusion `success`.
- Downloaded `Presence.Bridge_0.1.22_amd64.deb` matched its published SHA-256: `749ed9326327822f18ec1be01151589bad99f05e5cad33823e1ca69269693e92`.

## Scope notes

This is a local-first static/Tauri product. It has no product server-side endpoint or sign-in flow, so rate-limit and Entra-tenant checks do not apply. The optional license verifier is an external billing API and was covered by the declared minimization/no-payment-runtime claims.

## Defects

**P0: 0 · P1: 0 · P2: 0 · P3: 0.**
