# Presence Bridge — independent verification 12 handoff

## Result

**FAIL. Do not release candidate `57d6a7d77b6a886000198128178f8b2c90c07855`.**

The requested commit is not present locally or on GitHub. An exact fetch returns `upload-pack: not our ref`, and the GitHub commits API returns HTTP 422, `No commit found for SHA`. Because production cannot be tied to that object, the required candidate/deployment identity check fails.

- Requested candidate: `57d6a7d77b6a886000198128178f8b2c90c07855`
- Supplied checkout and current `origin/main`: `57d6a784584d76f26b6b0f66bdd9b6b5e081d527`
- Live desktop release source: `3a1c0740362341ae7115d3533a1b60276f9e8572` (`v0.1.19`)
- Live URL: <https://presence-bridge.sociobot.in>
- Full report: [`.factory/verification-12.md`](verification-12.md)

Defects: **P0: 0 · P1: 1 · P2: 0 · P3: 0**. The P1 is unavailable/mismatched candidate provenance. No separate product behavior defect was found.

## What was verified

- Mandatory first read and one-click sample demo: PASS at desktop and 390 × 844.
- All 26 exact `.factory/claims.json` commands after `npm ci`: PASS in both browser projects.
- `npm test`: PASS on clean rerun; 14 unit assertions and 92 browser tests passed, with two intentional desktop skips covered on mobile.
- Typecheck, copy audit, production build, dependency audit: PASS.
- Rust format, locked check/test, and Clippy with warnings denied: PASS after installing the release workflow's Linux prerequisites.
- Live claims and recovery matrix: 58/58 PASS.
- Live accessibility matrix: 32 PASS, two intentional desktop skips; zero serious/critical axe findings.
- Privacy flow: 20/20 requests same-origin; demo/real storage isolated; no console/page errors.
- Service-worker update and offline reload: PASS.
- Headers and caching: PASS; missing route is a true 404.
- Billing verification allowance: 30 requests; request 31 returned 429 with `Retry-After: 3`.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.13 s, TBT 48.5 ms, CLS 0.
- Bundle budgets: 43,982 B total JS raw, 19,488 B CSS, 30,482 B mobile hero, no fonts.
- Fresh build versus live: 24/24 public files match byte-for-byte for reachable checkout `57d6a784…`.
- v0.1.19 packages and release jobs: PASS; downloaded Debian and AppImage checksums match; packaged AppImage accepts all six documented opener schemes.

## Commands used

```sh
npm ci
npm test -- --grep @claim:<each-id-from-.factory/claims.json>
npm run lint
npm run audit:copy
npm test
npm run build
npm audit --audit-level=high
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo test --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npx playwright test tests/e2e/claims.spec.ts --workers=1
PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npx playwright test tests/e2e/accessibility.spec.ts --workers=1
```

## Required next step

Provide and push the intended candidate commit, then deploy that exact revision and rerun independent verification. If the work order SHA is a typo, correct it to a reachable full SHA before requesting release approval.

No product code was changed. Only this handoff and the verification report were updated.
