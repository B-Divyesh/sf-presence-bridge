# Presence Bridge repair 5 handoff

## Result: PASS

**Repair commit:** `a78e58587bab4e4c23a4aa7fa15dae4e59df649d`

**Release:** `v0.1.10`

**Release workflow:** `33260656884`

**Live URL:** https://presence-bridge.sociobot.in

The sole release blocker from `.factory/verification-6.md` is repaired. GitHub's
latest release is built from the exact repair commit, rather than the older
`166e4d6b6690157e154c22e0e2359116ae7734e1` source used for v0.1.8.

## What changed

- Synchronized the npm, lockfile, Cargo, Tauri, site, and app versions at
  `0.1.10`.
- Added `scripts/verify-release-provenance.mjs`. It rejects a release when its
  tag, target commit, or local version set differs from the expected build.
- Made the release manifest job query its own GitHub release and run that gate
  against `GITHUB_SHA` before publishing `SHA256SUMS` and `latest.json`.
- Added `source_commit` to `latest.json` for direct package provenance.
- Added regression coverage for aligned versions, the verifier's stale-commit
  case, workflow wiring, and the exact CLI path used in GitHub Actions.

The researched brief, local-first data boundary, demo, sharing behavior, visual
system, paid-tier availability state, and all previously passing behavior are
unchanged. No new image or AI feature was needed.

## Release evidence

- GitHub Actions run `33260656884`: success. The macOS universal, Windows, and
  Ubuntu Tauri build jobs passed. The manifest, Windows installer smoke, and
  Linux installer smoke jobs also passed.
- GitHub's latest-release API reports `v0.1.10` targeting exact commit
  `a78e58587bab4e4c23a4aa7fa15dae4e59df649d`.
- The release contains two macOS files, two Windows files, three Linux files,
  `SHA256SUMS`, and `latest.json`.
- Published `latest.json` reports version `0.1.10`, all three platform groups,
  and source commit `a78e58587bab4e4c23a4aa7fa15dae4e59df649d`.
- A fresh download of `Presence.Bridge_0.1.10_amd64.deb` passed
  `sha256sum --check`. Its SHA-256 is
  `683c9b1202710314a18b687c5099eaf80f61c90e41fdcbeb4ce529def16ec970`.
  `dpkg-deb` reports package `presence-bridge`, version `0.1.10`, architecture
  `amd64`.
- Local `CI=true npx tauri build` produced `.deb`, `.rpm`, and `.AppImage`
  bundles. The AppImage answered `--appimage-version` successfully.
- The intermediate v0.1.9 workflow exposed a CLI path defect in the new gate.
  v0.1.10 adds a CLI-level regression test and supersedes that incomplete
  release without rewriting its tag.

## Verification evidence

Run from `/work/repo`:

- `npm ci`: passed; 67 packages audited and 0 vulnerabilities.
- `npm test`: passed; 12 Vitest tests and 74 Playwright tests passed across
  desktop Chromium and 390 × 844 mobile. Two desktop skips are the intentionally
  mobile-only layout cases.
- `npm run lint`: passed with strict TypeScript checks.
- `npm run build:site`: passed and produced `dist/site/`.
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: compilation,
  unit targets, and doc tests passed.
- `PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npm run test:e2e`:
  74 passed and two intentional project skips. All 19 declared claims passed on
  desktop and mobile, including privacy, offline reload, service-worker update,
  demo isolation, sharing, installers, and release metadata.
- Playwright Axe found zero serious or critical violations across `/`, `/demo`,
  `/privacy`, `/terms`, `/download`, `/app.html`, and the real 404. Keyboard
  search, arrow navigation, dialog focus return, 200% text, 44px mobile targets,
  and reduced-motion behavior passed.
- `/opt/fleet/lib/verify-url.sh` found no console errors on the home, demo, or
  app routes. Each has a title, `lang=en`, one h1, one main landmark, complete
  image alternatives, and named buttons. Screenshots and reports are under
  `.factory/evidence/repair-5/`.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.2 s, CLS 0, and total blocking time 50 ms. Evidence is
  `.factory/evidence/repair-5/lighthouse.json`.
- Initial application JavaScript is 14.1 KB gzip, CSS is 5.1 KB gzip, and the
  mobile hero is 30,482 bytes.

## Deployment and response evidence

- Rebuilt from the repair commit and deployed `dist/site/` to the production
  `sf-presence-bridge` Azure Static Web App with the work order's static
  deployment configuration.
- The live site bundle contains build identity `0.1.10-a78e58587bab`.
- The live `site-ChudbRoo.js` and local production file share SHA-256
  `d46d5b71f8acdc00ad5428a9fb6541a75cc0be4a8562cb70cddb9363ce60b007`.
- `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` return 200;
  `/missing-page` returns the styled HTML response with status 404.
- HTML revalidates after 30 seconds, hashed assets are immutable for one year,
  and `sw.js` is `no-cache`.
- Live responses include CSP, HSTS, `nosniff`, strict-origin referrer policy,
  and disabled camera, microphone, and geolocation permissions.
- A fresh 390px browser loaded the real v0.1.10 AppImage link from GitHub with
  no console errors and no horizontal overflow.

## Known gaps and operator action

- Bridge Plus checkout remains unavailable and is described that way. The free
  five-person roster remains fully usable; existing licenses can be restored.
- Packages are unsigned until the owner provides `APPLE_CERTIFICATE`,
  `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`,
  and `WINDOWS_CERT_PASSWORD`. The download page explains the unsigned warning.
- The app does not implement automatic updates, so no updater manifest is
  shipped. Users install newer published packages explicitly.
