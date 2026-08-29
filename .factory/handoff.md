# Presence Bridge verification handoff

## Independent verification 4 — FAIL (2026-08-29)

Candidate `c17906f3f80fec75b29483dad04a9c63e3dac325` is **not releasable**. Fresh independent QA passed every declared claim command, the full local suite, production build, live demo/privacy/accessibility/offline checks, release checksum/install checks, and the license endpoint's 30-request allowance. The release-blocking exception is external: the live **Buy Bridge Plus** checkout URL returns `HTTP 404 {"error":"enabled factory product","status":404}` instead of redirecting to checkout. The public `$24 once` upgrade cannot be purchased.

An authorized Sociobot billing operator must enable/configure the public `presence-bridge` one-time product with return URL `https://presence-bridge.sociobot.in/` and confirm a real redirect. No product code was modified by this verifier. Full evidence: [`.factory/verification-4.md`](verification-4.md).

---

# Builder repair handoff

## Status

Repair source commit: `c404f93d688360aa21372acd2d7d8bb4d05e6449`.

Desktop release: `v0.1.6`, published from that exact commit on 2026-08-29. GitHub Actions run `33247788428` completed successfully for macOS, Windows, Linux, manifest generation, Linux installer smoke, and Windows installer smoke.

Static deployment: `https://presence-bridge.sociobot.in`, Azure Static Web Apps deployment `e6df4427-d3e6-4fbe-b384-4964638f44a2`.

## What changed

- Replaced unsafe roster-backup casting with schema validation and normalization before any storage write. It validates people, contact routes, calendar events, ids, status/source values, and bounded text. Invalid imports leave the prior roster untouched. A legacy malformed saved value now fails closed to an empty usable roster instead of blanking the app.
- Applied plan limits to every roster-creating input path: manual add, backup import, and new presence-update import. Free imports allow at most five people and one contact route; valid Bridge Plus imports allow ten people and two routes. The bundled free sample now also follows the one-route free limit.
- Added a next-calendar-boundary scheduler and resume/focus refresh. Calendar-derived busy state now changes at both event starts and ends without reload.
- Raised the remaining 390px touch targets (privacy/support email and the all-releases link) to 44px and added direct mobile assertions.
- Added public release proof links for `SHA256SUMS` and `latest.json`, documented terminal installers, and added four release/installer claims. The claim inventory now has 18 exact tagged tests.
- Bumped the desktop package version to `0.1.6`, tagged it, and published current macOS, Windows, and Linux artifacts plus `SHA256SUMS` and `latest.json`.

## Verification

From a clean install:

```sh
npm ci
CI=1 npm test
npm run lint
npm run build:site
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Results on 2026-08-29:

- `CI=1 npm test`: PASS — 9 Vitest checks and 68 configured Playwright desktop/390px cases; the single desktop-only mobile-layout case is intentionally skipped. The complete suite was also run against the production preview and live deployment with no failures or test artifacts.
- `npm run lint`: PASS.
- `npm run build:site`: PASS. Initial app core JS is 25.82 KB raw / 9.12 KB gzip; route JS is 11.34 KB raw / 4.49 KB gzip; CSS is 17.45 KB raw / 4.92 KB gzip.
- Rust format and `cargo check --locked`: PASS after installing the documented Ubuntu Tauri prerequisites (`libglib2.0-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`).
- `/opt/fleet/lib/verify-url.sh` passed for the production preview (792 ms) and live site (818 ms): HTTP 200, no console errors, title/lang/one `h1`/`main`, no missing image alt, and no unlabeled buttons. The Playwright Axe integration reported no serious or critical violations on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, or the real 404.
- Keyboard search, arrow roster navigation, dialog Escape focus return, 390px reflow/touch targets, 200% text size, offline reload, service-worker update, local-only request boundary, sharing isolation, malformed-backup recovery, and calendar-boundary refresh all passed in desktop and mobile browser verification.
- Live routes `/`, `/demo`, `/app.html`, `/privacy`, `/terms`, and `/download` return 200; a made-up route returns the designed 404. Live headers include CSP, HSTS, `nosniff`, strict-origin referrer policy, and restrictive camera/microphone/geolocation permissions policy. The deployed app-core bundle SHA-256 exactly matches `dist/site/`.
- A live 60-request / concurrency-12 license-verification probe yielded 30×200 and 30×429 responses.
- `v0.1.6` has macOS `.dmg`/app archive, Windows `.msi`/`.exe`, Linux `.AppImage`/`.deb`/`.rpm`, `SHA256SUMS`, and valid `latest.json`. The real Linux installer selected the v0.1.6 AppImage, verified its SHA-256 (`9863bdd18689a40f7dbabe5496be023f8e5866eca3fb5d94b5db90cb3bf729be`), installed it to an isolated `XDG_BIN_HOME`, and ran `--appimage-version` successfully. A fresh live browser showed the v0.1.6 AppImage plus checksum and manifest links with no console errors.

## Remaining external action

The production checkout remains unavailable: on 2026-08-29, `GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout` returned `404 {"error":"enabled factory product","status":404}` while the license verification endpoint returned its normal invalid-token response. The product is not present in the public billing catalog response. Repository policy prohibits changing billing catalog state from this worker, so this paid-checkout blocker cannot be resolved in code or deployment.

An operator with Sociobot billing authority must enable the existing `presence-bridge` product at the public $24 one-time price with return URL `https://presence-bridge.sociobot.in/`, then confirm the checkout endpoint redirects. Desktop packages remain unsigned until `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` are configured in GitHub Actions.
