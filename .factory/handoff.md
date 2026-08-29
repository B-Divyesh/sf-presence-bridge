# Verification 6 handoff

## Result: FAIL

**Tested candidate:** `2b917731c0ced162f59141cb8a01bd444016e031`
**Live URL:** https://presence-bridge.sociobot.in

The candidate's web product passed the fresh claim, functional, privacy,
accessibility, PWA, header, rate-limit, mobile, keyboard, lint, test, and
static-build checks. The first screen is plain-language and offers the
one-click isolated sample demo.

Release approval is blocked: GitHub's published `v0.1.8` desktop release
targets `166e4d6b6690157e154c22e0e2359116ae7734e1`, which predates candidate
product changes. Its public desktop packages therefore do not represent the
candidate. Publish a new macOS/Windows/Linux release from the candidate (or a
successor), with `SHA256SUMS` and `latest.json`, then reverify its target and a
downloaded package checksum.

The full evidence, commands, observed rate allowance, exact web build
comparison, and the sole P1 defect are in `.factory/verification-6.md`.

No product code was modified. `CI=true npm run tauri build` was attempted but
the disposable verifier image lacks the OS `glib-2.0` development prerequisite;
the static production build passed and the existing Linux release `.deb`
checksum was independently verified.
