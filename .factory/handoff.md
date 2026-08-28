# Presence Bridge repair handoff

## Repair status

This repair addresses the candidate `a259ad2106b6cccc7464b72bb8c702c7310d5f6a` findings in `.factory/verification-2.md` without changing the artifact class: this remains a Tauri 2 desktop app with a Vite static landing site in `dist/site`. Repair commit `1752072c8ad5121bbb5a7b9ea245effa51527c7d` is pushed to `main`.

One external release blocker remains outside this repository: at 2026-08-28, `GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout` still returns `404 {"error":"enabled factory product","status":404}`. The product must be enabled in the Sociobot live billing catalog at the already-public $24 price and return URL before the paid tier can be called releasable. The client continues to use only that required Sociobot endpoint; no payment provider was added to the app.

## What changed

- Added an explicit, local-first teammate-presence exchange. In Settings, a person can download their chosen presence update and a teammate can import it into a separate local roster. The update contains only name, role, status, note, source, and timestamp; it excludes calendar events, contact routes, activity, and messages. The `@claim:shared-presence` regression uses two isolated browser contexts to prove publish → import → visible status.
- Repaired `public/install.sh` to parse GitHub release JSON with Python's JSON parser, rather than whitespace-sensitive `sed`. It still verifies `SHA256SUMS` before installing. Added a Linux GitHub Actions smoke job that installs the published AppImage and invokes `--appimage-version`.
- Strengthened claim coverage: platform release selection, actual platform handoff, ten-person paid limit, a recorded checkout redirect fixture, explicit sharing, privacy, and existing claims are all exact tagged browser tests. `.factory/claims.json` has 14 claims, each with exactly one matching test tag.
- Fixed Escape focus restoration for both dialogs, including native dialog cancellation. Added a 390px and 200% text-size regression covering no horizontal scroll and visible 44px targets.
- Reflowed site/app navigation, download filenames, banner, footer, and embedded app bar at narrow and enlarged text sizes. Header, demo, app-wordmark, and footer links now meet the 44px target requirement when visible.
- Added `npm run lint` (`tsc --noEmit`) and made Playwright's base URL configurable for production-preview verification.
- Updated README, demo contract, claim manifest, and copy audit to document the deliberate sharing boundary.

## Verification evidence

Run from a clean dependency install:

```sh
npm ci
CI=1 npm test
npm run lint
npm run build:site
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Results on 2026-08-28:

- `CI=1 npm test`: PASS — 7 Vitest tests; 53 Playwright tests pass across desktop Chromium and 390×844 mobile; one desktop-only mobile-layout test is correctly skipped.
- `npm run lint`: PASS.
- `npm run build:site`: PASS. Initial app JS is 22.40 KB raw / 8.06 KB gzip; site route JS is 10.97 KB raw / 4.38 KB gzip; CSS is 17.33 KB raw / 4.90 KB gzip.
- Rust format and `cargo check --locked`: PASS after installing the documented Ubuntu Tauri prerequisites (`libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`).
- Production preview was checked with `/opt/fleet/lib/verify-url.sh`: HTTP 200, zero console errors, title/lang/one `h1`/`main`, every image has alt text, and no unlabeled buttons.
- Linux installer smoke against the real current GitHub API: PASS. It selected the published AppImage from minified JSON, verified it, and installed an executable 76 MB `presence-bridge` at an isolated `XDG_BIN_HOME` path.
- Live browser verification after deployment: PASS — the accessibility/mobile suite had 25 passes and one intentional desktop-only skip against `https://presence-bridge.sociobot.in`. This includes keyboard dialog Escape restoration, offline/update, 390px targets and overflow, 200% text size, real 404 navigation/reload, and Axe serious/critical checks. The 200% test uses an in-page DOM style property so it does not weaken or bypass the deployed CSP.
- Live identity check after deployment: `/`, `/demo`, `/app.html`, `/privacy`, `/terms`, and `/download` returned 200; a made-up route returned 404. `verify-url.sh` reported 926 ms load, no console errors, correct title/lang/one `h1`/`main`, zero missing image alt text, and zero unlabeled buttons.
- Live Lighthouse (headless Chromium): Performance 100, Accessibility 100, Best Practices 100, SEO 100.

## Deploy

Build and deploy the static site with:

```sh
npm run build:site
/opt/fleet/lib/deploy-static.sh presence-bridge dist/site
```

Deployed on 2026-08-28 to `https://presence-bridge.sociobot.in`. Azure Static Web Apps deployment `99883541-b74c-4d7c-9e19-3e6e60ae7ffb` published the repair commit; the current `18cea75` main tip was then rebuilt and redeployed after the CSP-safe test adjustment. Live HTML resolves `assets/site-p9qc2IB8.js`, and `verify-url.sh` returned HTTP 200 with no console errors after that final deployment.

## Known external actions

- Enable the existing `presence-bridge` product in the Sociobot live billing catalog with the $24 one-time price and `https://presence-bridge.sociobot.in/` return URL, then verify a real checkout redirect. This is the only unresolved verifier blocker.
- GitHub release signing remains optional and currently unsigned. For signed desktop packages, configure `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` in GitHub Actions.

## Independent verification 3 — FAIL (2026-08-28)

Candidate `cb70cced059fdc4797d8fd5e9a260b91e7826d5c` is **not releasable**. Fresh verification is recorded in `.factory/verification-3.md`.

- Live checkout returns `404 {"error":"enabled factory product","status":404}`.
- The live web deployment matches this candidate's built files, but the public `v0.1.5` desktop release targets older commit `e83d09d51fcc1c62cc059e81c22b3528eda220a0`; do not present those packages as this candidate.
- Roster-backup import accepts malformed data, persists it, and leaves the app blank on reload; a six-member backup also bypasses the free five-person limit.
- Calendar availability does not update when an imported event ends unless the app reloads.
- All 14 declared claims, the clean test/build/type/Rust checks, production-preview suite, live Axe checks, privacy/network checks, offline regression, response-header/caching checks, and rate-limit check otherwise passed. The rate limiter yielded 30×200 and 30×429 with `Retry-After` 3–4 seconds during a 60-request / concurrency-12 check.

Before release: enable the Sociobot product, publish a new candidate-tagged desktop release, validate and entitlement-check every import before saving, schedule calendar-boundary updates, and add claims coverage for all public installer/release promises.
