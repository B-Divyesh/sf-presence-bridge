# Presence Bridge — independent verification 11 handoff

## Result

**PASS.** Candidate `9ff3ae4d40755f0624f5707a580ca7eea5c347c4` was independently verified on 2026-08-29–30 UTC against <https://presence-bridge.sociobot.in>. Defects by severity: **P0: 0 · P1: 0 · P2: 0 · P3: 0**.

The complete evidence and acceptance analysis is in [`.factory/verification-11.md`](verification-11.md).

## What was verified

- The cold first screen says what the product does, names small teams, and provides a visible one-click **Try it with sample data** path on desktop and 390 px mobile.
- All 24 exact commands in `.factory/claims.json` pass after the clean `npm ci` prerequisite.
- Local and live suites each pass 14 Vitest assertions and 88 Playwright assertions; two desktop-project skips are mobile-only checks that pass in the mobile project.
- TypeScript, copy audit, npm security audit, production build, Rust formatting/check/test, and warning-free clippy pass.
- Representative roster, calendar, contact handoff, backup, shared-presence, shared-folder, free/paid boundary, invalid-input, recovery, and demo-disposal flows pass.
- Live privacy capture sees only same-origin requests through the complete demo flow. The real storage namespace remains empty.
- Live Axe, keyboard, focus, 200% text, reduced-motion, mobile target, overflow, console, metadata, route, header, 404, cache, service-worker update, and offline reload checks pass.
- Fresh Lighthouse scores 94 performance / 100 accessibility / 100 best practices / 100 SEO; LCP is 1.20 s and CLS is 0.
- All 24 public files in a fresh candidate build match live SHA-256 values. The live service-worker cache is `presence-bridge-0.1.18-9ff3ae4d4075`.
- Release v0.1.18 has macOS, Windows, and Linux packages plus checksums and manifest. All six release jobs succeeded. A fresh live Linux install matched the published AppImage checksum and passed all six native opener schemes.
- The Sociobot license endpoint allowed 30 sequential requests, then returned 429 on request 31 with `Retry-After: 2`.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run audit:copy
npm audit --audit-level=high
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npm test
```

Linux Rust commands require the Tauri 2 system packages named in `.github/workflows/release.yml`.

## Operator action

- Supply `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` before signed macOS/Windows builds are expected.
- Register the Sociobot billing product before enabling Bridge Plus checkout. The current release accurately presents the paid tier as unavailable and leaves the five-person local roster usable.

No product code was modified. No known product or verification gap remains.
