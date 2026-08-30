# Presence Bridge — repair 9 handoff

## Result

**PASS — the only release-blocking finding in independent verification 12 is repaired.**

The verifier was asked to identify candidate `57d6a7d77b6a886000198128178f8b2c90c07855`, which does not exist. The work order supplied the reachable correction `57d6a784584d76f26b6b0f66bdd9b6b5e081d527`; it resolves successfully. Release candidate checks now reject an unavailable full SHA before packaging and verify that the published release targets the exact candidate.

- Deployed static and desktop-release source: `b78ad7c7d8ee314a23012ab0c7b2f50d5b90eb59`
- Desktop release: [`v0.1.21`](https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.21)
- Release workflow: <https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33289141611>
- Live site: <https://presence-bridge.sociobot.in>
- Live build marker: `0.1.21-b78ad7c7d8ee`

## What changed

- Added `npm run verify:candidate -- <full-sha>`. It requires a full SHA and resolves it to a commit in the checkout.
- Added the same preflight to every GitHub Actions release build, explicitly under Bash so Windows receives `${GITHUB_SHA}` correctly.
- Kept the existing post-release tag/target and `latest.json` provenance check.
- Added an exact regression in `tests/unit/release-contract.test.ts`: the reachable work-order SHA passes, and the verifier's unavailable SHA fails with `Candidate … is unavailable in this checkout.` The workflow test also requires the Bash shell declaration.
- Released `v0.1.21` because the desktop artifact and displayed build version changed. No roster, privacy, demo, contact handoff, storage, accessibility, offline, or visual behavior was changed.

## Verification

From a clean dependency install, on the repair source:

```sh
npm ci
npm run lint
npm run test:unit
npm run audit:copy
npm test
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

- `npm ci` completed with 67 audited packages and no vulnerabilities.
- Typecheck, copy audit, and production build passed. The committed copy audit remains in sync with the rendered landing page and README.
- `npm test` passed 15 Vitest assertions and all executable Playwright cases in desktop and 390 px projects; the two desktop-only mobile assertions are intentional and pass in the mobile project.
- All declared claim flows pass, including privacy-local, calendar-local, contact handoff, demo isolation, offline reload, service-worker update, package/download recovery, keyboard navigation, and the free limits.
- After installing the Linux packages declared in the release workflow, Rust format, locked check, test, and warnings-denied Clippy passed. The native shared-folder boundary test passed.
- Production build budgets: 43,982 B raw JavaScript, 19,488 B raw CSS, and a 30,482 B mobile hero image. No font files are shipped.
- Local `verify-url.sh` passed `/`, `/demo`, and `/app.html` with no console/page errors, one H1, `lang=en`, a main landmark, complete image alternatives, and named controls. The Playwright Axe integration passed on all public routes and both viewport projects with no serious or critical findings. The standalone Axe CLI could not auto-discover Chrome in this container; it was not needed because the integrated scan is the supported equivalent.

## Live and release evidence

- Azure Static Web Apps deployed `dist/site/` with `swa deploy dist/site --app-name sf-presence-bridge --resource-group sociobot --env production --no-use-keychain`. The live site loads `site-CO6anmw3.js`, which contains the exact source marker `0.1.21-b78ad7c7d8ee`.
- SHA-256 comparison of every 24 publicly served file in the fresh production build found zero mismatches against live. `staticwebapp.config.json` remains host configuration rather than a served file.
- Live `verify-url.sh` passed `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html`; `/missing-page` returned the styled 404 with HTTP 404. No console/page errors appeared.
- The live complete claims/accessibility sweep passed after deployment in desktop and 390 px Chromium projects. It covers keyboard search, dialog focus return, 44 px mobile controls, zero serious/critical Axe issues, privacy request boundaries, offline reload, and service-worker replacement.
- Live headers include CSP with `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options: nosniff`, strict referrer policy, and disabled camera/microphone/geolocation.
- Mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.3 s, TBT 100 ms, CLS 0, and 53 KiB total transfer.
- All six `v0.1.21` GitHub Actions jobs passed: macOS universal, Windows, Linux, manifest, Linux installer smoke, and Windows installer smoke.
- `node scripts/verify-release-provenance.mjs /tmp/presence-bridge-v0121-release.json b78ad7c7d8ee314a23012ab0c7b2f50d5b90eb59 v0.1.21` printed `Verified v0.1.21 targets b78ad7c7d8ee314a23012ab0c7b2f50d5b90eb59.`
- Published `latest.json` has `version: 0.1.21`, the same `source_commit`, and macOS, Windows, and Linux package URLs. A fresh `Presence.Bridge_0.1.21_amd64.deb` matched `SHA256SUMS`; `dpkg-deb` reports `presence-bridge / 0.1.21 / amd64`.

## Run locally

```sh
npm ci
npm test
npm run lint
npm run audit:copy
npm run build
npm run verify:candidate -- "$(git rev-parse HEAD)"
```

For native checks, install the Ubuntu packages in `.github/workflows/release.yml`, then run the Cargo commands in the verification section.

## Known gaps and operator action

- The incomplete `v0.1.20` GitHub Release created during the first repair attempt was retired after `v0.1.21` passed. Its source tag remains for audit history; GitHub's latest release is `v0.1.21` and targets the deployed source.
- macOS and Windows packages are unsigned until the owner configures `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` in GitHub Actions.
- No product QA finding remains open. Bridge Plus checkout remains intentionally unavailable; the free five-person roster and all accessibility/privacy behavior stay available.
