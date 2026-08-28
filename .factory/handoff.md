# Presence Bridge independent verification handoff

## Outcome — FAIL

Candidate `a259ad2106b6cccc7464b72bb8c702c7310d5f6a` was independently tested on 2026-08-28 at https://presence-bridge.sociobot.in. **Do not release.** The repaired static deployment matches the candidate and its automated gates pass, but fresh end-to-end evidence found release blockers. Full evidence is in `.factory/verification-2.md`.

## Release blockers

- The live **Buy Bridge Plus** endpoint returns HTTP 404 (`{"error":"enabled factory product","status":404}`), so the advertised $24 purchase cannot be completed.
- `public/install.sh` exits **“No Linux AppImage is published yet”** against GitHub's current minified API JSON even though release `v0.1.5` has an AppImage. Its `sed` parser depends on spaces in JSON formatting.
- A user's manual or calendar-derived presence is stored only on that device. No transport makes it visible to another teammate, so the researched presence-check job is not end to end.
- Claim coverage is incomplete: the price test checks only an `href`, the paid-roster test does not prove ten members, the handoff test checks only a toast, and installer/release promises are unlisted.
- At 390px, `/download` scrolls horizontally (`451px` content in a `390px` viewport). At 200% text size, all site routes overflow.
- Closing a modal with Escape drops focus to `<body>`. Several header, demo-banner, wordmark, and footer links are below the required 44px touch size.

## What passed

- First-read gate and one-click sample demo.
- All 12 listed claim commands after `npm ci` in desktop and 390px mobile projects.
- `npm test`: 5 unit and 44 Playwright tests.
- `npx tsc --noEmit`, `npm run build`, Rust formatting, and `cargo check --locked` with declared Linux prerequisites.
- All 44 browser tests again against `dist/site/` via production preview.
- Live axe: zero serious/critical findings on all main routes in both viewports.
- Demo privacy, storage isolation, invalid-input recovery, offline reload, service-worker cache update, security headers, and asset caching.
- Lighthouse mobile: 100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO; LCP 1.35s, CLS 0, TBT 0ms.
- Live build ID `0.1.5-a259ad2106b6`; sampled production files are byte-identical to the candidate build.
- Release assets exist for macOS, Windows, and Linux. The downloaded Windows EXE matched SHA-256 `6de536a3155635f902f0c2978a96ca6bca99956b153cdeb43807273b3c321ee6`.
- License API burst: 30×200 then sustained 30×429; every 429 included `Retry-After: 4`.

## Run and verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build:site
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Static deployment directory: `dist/site`.

## Needs operator action

- Enable and end-to-end verify `presence-bridge` in the Sociobot live billing catalog at $24 once.
- Repair and smoke-test the Linux installer against the real GitHub API response.
- Decide and implement the opt-in mechanism that makes one teammate's presence visible to another.
- Repair mobile reflow, touch targets, and dialog focus restoration; add regression tests.
- Bring `.factory/claims.json` and its tests into exact coverage of every public promise.
- Add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, and `APPLE_SIGNING_IDENTITY` for signed and notarized macOS packages.
- Add `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD` for Authenticode signing. Current packages are functional but unsigned, and the download page says so.
