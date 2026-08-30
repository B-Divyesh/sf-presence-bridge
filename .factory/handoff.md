# Presence Bridge handoff

## Status

Polish round 4 is complete. All 26 findings from reviews 1–4 are resolved, tested from a clean clone, released, deployed, and checked cold on the live site.

- Live site: https://presence-bridge.sociobot.in
- Demo: https://presence-bridge.sociobot.in/?demo=1
- Desktop release: https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.22
- Release workflow: https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33293510396
- Repair source: `992682353261f38d2bd3be260dbbba132ea72dbf`
- Evidence matrix: `.factory/polish-4.md`

## What changed

- Made Playwright deterministic by running one worker and confining offline/service-worker state to disposable browser contexts.
- Strengthened privacy tests to cover profile settings, shared-folder choice, roster data, license tokens, and cached license verdicts.
- Strengthened the no-tracker test across every route, request, runtime dependency, and production import.
- Removed the last decorative and subjective phrases from the first screen and README.
- Preserved the product's paper-logbook visual system, Tauri 2 desktop class, isolated demo, native folder watching, real routing, platform downloads, and legal routes.
- Updated the catalog line to: “See who is free, then open the contact tool your small team already uses.”

## Exact verification

Clean clone: `/tmp/presence-bridge-polish4-PciPcB/clone`, checked out at the repair source above.

- `npm ci`: passed; 66 packages, 0 vulnerabilities.
- `npm run lint`: passed.
- `npm run audit:copy`: passed, 2 tests.
- `npm test`: passed twice consecutively. Each run passed 15 unit tests and 92 Playwright tests; 2 desktop-only skips were intentional.
- Every command in `.factory/claims.json`: 26/26 passed verbatim. See `.factory/evidence/polish-4/claim-results.json`.
- `npm run build`: passed and produced `dist/` and `dist/site/`.
- `npm audit --audit-level=high`: passed with 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo check --manifest-path src-tauri/Cargo.toml --locked`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: passed, including the bounded shared-folder reader test.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --locked -- -D warnings`: passed.

Build budgets:

- App core JS: 30.61 KB raw / 10.56 KB gzip.
- Landing JS: 12.81 KB raw / 4.79 KB gzip.
- CSS: 19.49 KB raw / 5.31 KB gzip.
- Mobile hero image: 30,482 bytes.

Local and live verification:

- The route verifier passed `/`, `/?demo=1`, `/privacy`, `/terms`, `/download`, and `/app.html` with correct title, language, main landmark, image alternatives, button names, and no unexpected console errors.
- Local Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0.
- Live Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0.
- The full suite against the live URL passed: 15 unit tests, 92 Playwright tests, 2 intentional desktop skips.
- Cold mobile checks confirmed all three facts fit the first screen, Privacy remains visible, the one-click demo shows all three sample people, reset/exit discard demo state, route focus moves to headings, and the 404 is real.
- Offline reload returned HTTP 200 and retained Ava from the demo sample.
- Live crawl checked 20 links with 0 failures. CSP, HSTS, MIME-sniffing, referrer, and permissions headers are present.
- All 24 deployed public files match the local `dist/site` hashes.

Release verification:

- All six release workflow jobs passed for macOS, Linux, Windows, manifest, and both installer smoke tests.
- Release provenance maps `v0.1.22` to the exact repair source.
- `latest.json` names v0.1.22 and includes macOS, Windows, and Linux assets.
- The downloaded Debian asset was 4,788,054 bytes and matched SHA-256 `749ed9326327822f18ec1be01151589bad99f05e5cad33823e1ca69269693e92` from `SHA256SUMS`.

## Run and verify

```bash
npm ci
npm run lint
npm run audit:copy
npm test
npm run build
```

For native checks, install the Tauri Linux prerequisites, then run the Cargo commands listed above. Preview the landing build with `npm run preview:site`; preview the app with `npm run preview`.

## Known gaps and operator action

There are no unresolved review or QA findings.

Bridge Plus checkout remains intentionally unavailable because no registered billing product was supplied. The UI makes no price or purchase promise.

Release packages are unsigned unless the operator configures these repository secrets: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`. The download page states the signing status plainly.
