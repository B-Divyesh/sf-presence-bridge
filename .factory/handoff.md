# Presence Bridge — repair handoff

## Result

Perfection-loop round 3 is complete. All 21 findings across `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` are resolved and mapped in [`.factory/polish-3.md`](polish-3.md).

- Product: Presence Bridge v0.1.19, Tauri 2 desktop app with a static browser companion.
- Repair source: `3a1c0740362341ae7115d3533a1b60276f9e8572`.
- Live site: <https://presence-bridge.sociobot.in>
- Demo: <https://presence-bridge.sociobot.in/?demo=1>
- Release: <https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.19>
- Release workflow: <https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33284547730>
- Static deployment ID: `4e648ff2-6680-4bab-80b0-399333853ae1`.

## What changed

- Added explicit `license-restore` and `status-note` claims and outcome tests.
- Expanded `privacy-local` to prove clearing site storage deletes the roster, license token, and cached verdict.
- Removed the unavailable merchant-of-record statement.
- Rewrote all four review-3 README phrases with the review's plain, consistent terminology.
- Preserved every earlier demo, routing, metadata, 404, focus, mobile, copy, folder-watching, installer, offline, privacy, and accessibility repair.
- Updated the catalog description to the 75-character verb-first sentence: “Check your small team's status, then open the contact tool you already use.”
- Bumped and released the desktop artifact as v0.1.19 because app Settings changed.

## Verification

From clean clone `/tmp/presence-bridge-polish3-krkKBI/clone` at the pushed repair source:

- `npm ci` — passed, 66 packages, zero audit findings.
- All 26 exact claim commands from `.factory/claims.json`, one by one — 26/26 passed in both browser projects, or 52 matched claim executions.
- `npm test` — 14 unit assertions and 92 browser tests passed; two expected Chromium skips are mobile-only assertions that passed in the mobile project.
- `npm run lint` — passed.
- `npm run audit:copy` — two copy-audit checks passed.
- `npm run build` — passed and produced `dist/site/` and `dist/app/`.
- `npm audit --audit-level=high` — zero vulnerabilities.

Native checks in the repair workspace:

- `cargo fmt --check` — passed.
- `cargo check --locked` — passed.
- `cargo test --locked` — passed, including `reads_only_bounded_presence_files`.
- `cargo clippy --all-targets -- -D warnings` — passed.

Live checks after deployment:

- `PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npm test` — 14 unit assertions and 92 browser tests passed; two expected desktop-project skips.
- `/opt/fleet/lib/verify-url.sh` passed `/`, `/?demo=1`, and `/app.html` with one H1, `lang=en`, a main landmark, alt text, named controls, and no console errors. Reports and screenshots are under `.factory/evidence/polish-3/live-*`.
- A cold 390 × 844 visit kept Privacy and all three facts in view; fact bottoms were 619, 643, and 667 px. One click opened four sample teammates; three rows ended within 765 px. Reset restored the seed, and Start for real opened a zero-person real roster.
- `/`, `/demo`, `/privacy`, `/terms`, and `/download` returned 200 with distinct titles, descriptions, canonicals, and one H1. `/missing-page` returned the designed HTTP 404 with its own metadata and home action.
- Axe checks embedded in the Playwright accessibility suite found no serious or critical violations on every public route in both browser projects.
- Lighthouse mobile report: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.90 s, LCP 1.43 s, TBT 35 ms, CLS 0, total transfer 149,338 bytes. Raw report: `.factory/evidence/polish-3/lighthouse.json`.
- Production build budgets: CSS 19.49 KB raw / 5.31 KB gzip; site JS 12.77 KB / 4.78 KB gzip; shared app JS 30.61 KB / 10.56 KB gzip.

Release checks:

- GitHub Actions run `33284547730` passed all six jobs: macOS universal, Windows, Linux, manifest, Linux installer smoke, and Windows installer smoke.
- v0.1.19 publishes DMG/app tarball, MSI/EXE, AppImage/DEB/RPM, `SHA256SUMS`, and `latest.json`.
- `latest.json` records source `3a1c0740362341ae7115d3533a1b60276f9e8572` with 2 macOS, 2 Windows, and 3 Linux packages.
- A cold Debian download matched `SHA256SUMS`: `3cc65ee1a616c290d1c3e297a4aaf2b8f0c594f63495ed6ed51d273681f89603`.
- The Linux installer smoke downloaded the published AppImage, checked its SHA-256, and exercised all six native openers under Xvfb. The Windows smoke installed and launched the published setup.

## Run locally

```sh
npm ci
npm test
npm run lint
npm run audit:copy
npm run build
```

For native checks, install the Tauri 2 Linux packages listed in the release workflow, then run:

```sh
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

## Known gaps and operator action

No review finding is open. Bridge Plus checkout remains intentionally unavailable, and the free five-person roster remains fully usable.

Current packages are unsigned unless the repository owner configures signing. To sign later, add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` to GitHub Actions secrets and issue a new version tag.
