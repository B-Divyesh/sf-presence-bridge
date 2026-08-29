# Presence Bridge — verification 10 handoff

## Independent QA result

**PASS** for candidate `3bcd3e50d23963398d0f416f3e7450a4b79fc1dc` / release `v0.1.17` at https://presence-bridge.sociobot.in.

Independent verification found no release-blocking defects. The live public files match a fresh `npm run build` output byte-for-byte, the release targets the candidate SHA, and the checksum-verified published AppImage accepted all six actual Tauri contact handoffs (Slack, Teams, HTTPS/Meet, email, Zoom, and phone) in its native smoke path.

Verified with `npm ci`, every claim command in `.factory/claims.json`, `npm test` (76 Playwright passed, 2 intentional skips; 13 Vitest passed), `npm run lint`, `npm run build`, `npm audit --audit-level=high`, Rust fmt/check/test after documented Linux prerequisites, published deb checksum/package metadata, published AppImage native smoke, live request/header/cache inspection, 390 px keyboard/accessibility checks, and a 30-request license allowance followed by 429/`Retry-After: 4` on request 31. Full evidence is in `.factory/verification-10.md`.

Known product defects: none. The existing unsigned-package/operator-action note remains below.

# Presence Bridge repair 8 handoff

## Result

Release blockers P1 and P2 from independent verification 9 are repaired in version `0.1.17`. The immutable product-code repair commit is `878f7737530b9d02bcf8b47976a9d45fac6fcfb1`. The researched scope and existing passing behavior are unchanged.

## Failure reproduced before repair

- Native ACL inspection resolved `opener:default` to `mailto:*`, `tel:*`, `http://*`, and `https://*`. It rejected the advertised `slack:*`, `msteams:*`, and `zoommtg:*` schemes and exited 1.
- A fresh 390 × 844 Chromium measurement reproduced the verifier's exact missed targets: `Check SHA256SUMS` 163.8125 × 19 px; `Read latest.json` 209.109375 × 43.796875 px; Settings `terms` 37.0625 × 15 px; Settings `privacy` 45.140625 × 15 px; standalone footer `Terms` 40.03125 × 44 px. The reproduction exited 1.

## Repairs

- `src-tauri/capabilities/default.json` now adds explicit `opener:allow-open-url` scopes for `slack:*`, `msteams:*`, and `zoommtg:*`. Tauri's existing default permission remains responsible for HTTPS, email, and phone links.
- The native `--smoke-opener` path invokes the real `plugin:opener|open_url` IPC command inside the packaged webview for exact Slack, Teams, Meet/HTTPS, email, Zoom, and phone fixtures. It exits nonzero if any URL is rejected or reordered.
- The release job installs the checksum-verified Linux AppImage, runs that native command under Xvfb, records OS-opener calls, and diffs all six exact URLs. This closes the prior browser-only false positive.
- Every visible link and control now has a minimum 44 × 44 CSS-pixel hit area. Release proof links wrap with 8 px gaps, dialog legal links inherit full target sizing, checkboxes are 44 px, and mobile header links retain 8 px separation.
- The mobile regression scans every visible interactive element on home, privacy, terms, download with dynamic release metadata, standalone app, demo, Settings, and Add person. Failure output identifies the route, element, text, width, and height.
- Product, Rust, lockfile, UI, fixture, and release-workflow versions are aligned at `0.1.17`.

## Verification evidence

- `npm ci`: 66 packages installed; 67 audited; 0 vulnerabilities.
- `npm test`: 13 Vitest tests and 76 Playwright tests passed across desktop Chromium and 390 × 844 mobile; 2 desktop skips are intentionally mobile-only.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:4174 npx playwright test` against `vite preview`: 76 passed; 2 intentional desktop skips.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and wrote `dist/site/`. Initial JS is 40.85 KB raw / 14.73 KB gzip; CSS is 19.04 KB raw / 5.21 KB gzip; mobile hero is 30.48 KB.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `CI=true npx tauri build --bundles appimage`: produced the versioned Linux AppImage.
- The locally packaged AppImage ran under Xvfb with `--smoke-opener` and printed `native opener accepted` for all six exact fixtures: Slack, Teams, Meet, email, Zoom, and phone. Exit code was 0.
- The full browser suite covers keyboard search and arrow/Enter navigation, Escape focus return, invalid-input focus, dialog focus containment, Axe scans, 200% text, reduced motion, demo isolation, no-analytics request capture, offline reload, service-worker replacement, license response policy fixtures, and every declared claim.
- Fresh mobile Lighthouse on the production preview: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,731.7 ms; CLS 0; TBT 32 ms; transfer 134,218 bytes.
- `.factory/copy-audit.md` remains current: no landing or README sentence exceeds 22 words and no banned term appears.

## Release and deployment identity

- Tag and accepted release: `v0.1.17`. The preceding `v0.1.14` through `v0.1.16` matrices published packages while the new gate exposed clean-runner dependencies and an AppImage PATH assumption. The accepted job installs EGL and GLES, disables WebKit compositing for headless execution, captures the packaged command's results, and asserts all six exact accepted URLs.
- The tag commit, GitHub release target, `latest.json.source_commit`, release-workflow source SHA, and deployed build SHA were compared for equality after publication.
- The release publishes macOS, Windows, and Linux packages plus `SHA256SUMS` and `latest.json`. The Linux release smoke installs the published AppImage only after checksum verification, then exercises the native opener command.
- Static output was rebuilt from the tagged commit and deployed from `dist/site/` with `/opt/fleet/lib/deploy-static.sh presence-bridge dist/site`.
- Live checks used `/opt/fleet/lib/verify-url.sh`, browser desktop and 390 px suites, security/cache headers, offline/update behavior, same-origin privacy logging, and build-ID comparison.

## Run it

```sh
npm ci
npm test
npm run lint
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
CI=true npx tauri build --bundles appimage
```

For the one-click sandbox, open `http://localhost:4173/demo` after `npm run dev`.

## Known gaps and operator action

- macOS and Windows packages remain unsigned unless the operator supplies `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` to GitHub Actions.
- Bridge Plus checkout remains unavailable because the external Sociobot product is not registered. The UI continues to disclose this and exposes no dead purchase link; the free roster remains complete.
- No repository, release, deployment, accessibility, privacy, offline, or native-opener blocker is known. Independent verification is the next step.
