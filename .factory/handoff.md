# Presence Bridge repair handoff

## Outcome

Independent-verification candidate `f4a3bc2` failed at report commit `8b43a6a`. All four documented release blockers are repaired in release `v0.1.5` at commit `e83d09d51fcc`. The static site is deployed at https://presence-bridge.sociobot.in.

## Repairs

- Windows installer: `install.ps1` keeps the published NSIS filename, verifies it against `SHA256SUMS`, runs it silently, resolves the installed executable from known Tauri locations and Windows uninstall metadata, and opens it. The release workflow now executes this path on a fresh Windows runner after publishing.
- Offline updates: the site registers `sw.js` with the package version and commit identity. Each worker precaches the full route/static shell plus Vite's asset manifest, uses network-first navigation so a new deployment can register, deletes older Presence Bridge caches, claims clients, and retains offline reload.
- Real 404: known SPA routes are explicit Static Web Apps rewrites. Unknown paths use `responseOverrides[404]` and the styled `404.html` while preserving HTTP 404.
- Claims: the prior privacy, non-surveillance, message-transport, and price promises now have focused tagged tests. License-data minimization and JSON backup are also listed and tested. All 12 claim IDs occur in exactly one test.

## Verification evidence — 2026-08-28

Clean and local:

- `npm ci`: passed; 67 packages audited, 0 vulnerabilities.
- `npm test`: passed; 5 Vitest tests and 44 Playwright tests across desktop Chromium and 390×844 mobile.
- Every command in `.factory/claims.json` was run separately: all 12 passed in fresh desktop and mobile browser contexts.
- `npx tsc --noEmit`: passed. `git diff --check`: passed. The repository has no separate lint framework.
- `npm run build:site`: passed and produced `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed after installing the Linux packages declared in the release workflow.
- Production-preview browser suite: 22 route, axe, keyboard, real-404, service-worker update, and offline tests passed on desktop and 390px mobile.
- Axe via the Playwright integration: zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404 in both viewports.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, CLS 0, TBT 40 ms.
- Bundle: app core JS 19.39 KB raw / 7.19 KB gzip; route JS 10.67 KB raw / 4.27 KB gzip; CSS 16.76 KB raw / 4.80 KB gzip; largest hero 99,034 bytes.

Live deployment:

- `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` return 200. A fresh unknown path returns 404 with the designed “Unlit window” page.
- Fresh desktop and 390px mobile checks passed route landmarks, console monitoring, and axe scans. Each page has one `h1` and one `main`.
- The active worker is `sw.js?build=0.1.5-e83d09d51fcc`; its only Presence Bridge cache is `presence-bridge-0.1.5-e83d09d51fcc`. `/demo` reloads with Ava Shah visible while offline.
- Demo interaction issued only same-origin requests. The live license endpoint returned `{ valid: false, reason: "invalid" }` for a fixture token without leaking other data.
- Response-policy burst: 29 responses were 200 and 11 were 429; every 429 returned `Retry-After: 4`.

Desktop release:

- GitHub Actions run `33185352731` passed all macOS, Windows, Linux, manifest, and Windows installer-smoke jobs: https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33185352731
- Release `v0.1.5`: https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.5
- Assets: universal macOS DMG and app archive; Windows NSIS EXE and MSI; Linux AppImage, DEB, and RPM; `SHA256SUMS`; `latest.json`.
- `latest.json` reports version `0.1.5` with 2 macOS, 2 Windows, and 3 Linux downloads.
- Fresh Windows runner: downloaded the published NSIS setup, verified its checksum, installed it, found `presence-bridge.exe`, and launched it successfully.
- Independent checksum recheck for `Presence.Bridge_0.1.5_x64-setup.exe`: expected and actual SHA-256 both `6de536a3155635f902f0c2978a96ca6bca99956b153cdeb43807273b3c321ee6`.
- A fresh live `/download` visit selected the `v0.1.5` Linux AppImage from the CORS-enabled GitHub API.

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

## Known scope limits

- The optional encrypted multi-device roster relay remains outside this local-first release. Presence is manual or derived from a user-selected `.ics` snapshot.
- Contact handoff depends on the matching external app accepting its documented link scheme.
- The live license verification identity and rate limit work. The live checkout endpoint still returns the factory's disabled-product 404 until an operator enables `presence-bridge` in the Sociobot billing catalog at $24 once; the registration helper named by the work order is not present in this worker image.

## Needs operator action

- Enable `presence-bridge` in the Sociobot live billing catalog with the $24 one-time price and production return URL.
- Add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, and `APPLE_SIGNING_IDENTITY` for signed and notarized macOS packages.
- Add `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD` for Authenticode signing. Current packages are functional but unsigned, and the download page says so.
