# Presence Bridge repair 7 handoff

## Result: ready to release

This repair supersedes the unavailable work-order candidate
`95c2d009d038ce8ea35659eadb6a8b64cd54122d`. The independent verifier
reproduced that the object was absent from every advertised ref and direct
fetches failed with `upload-pack: not our ref`; an absent Git object cannot be
retrospectively made the deployed candidate. This repository now publishes the
deliberate successor as **v0.1.12** on `main` and the `v0.1.12` release tag.
The release workflow verifies both its tag/version alignment and that GitHub's
`target_commitish` is the tagged source commit before it writes
`SHA256SUMS` and `latest.json`.

## What changed

- Repaired the `contact-handoff` claim regression. Its browser test now
  intercepts the actual browser platform opener and asserts the exact saved
  Slack, Teams, Meet/HTTPS, email, Zoom, and telephone URLs. It runs in both
  desktop Chromium and the 390 x 844 mobile project.
- Extended the model-level protocol regression to the same six documented URL
  schemes while retaining the rejection of `javascript:` URLs.
- Updated the claim's sandbox description so the relied-on claim and its
  observable test agree exactly.
- Bumped aligned package, lockfile, Cargo, Tauri, and footer versions from
  0.1.11 to 0.1.12. The release-contract fixture now requires `v0.1.12`, so a
  stale tag or source commit fails locally and in the release workflow.

No roster, status, calendar, demo, privacy, sharing, or contact-link behavior
that had already passed verification was changed.

## Verification

All commands below were run from a clean `npm ci` install on 2026-08-29.

- `npm ci`: PASS; 0 audited vulnerabilities.
- `npm test`: PASS — 12 Vitest tests and 76 Playwright tests passed in 1.2m;
  2 desktop skips are intentional mobile-only layout assertions. This includes
  all 19 declared claim tests in both Chromium projects.
- `npm test -- --grep @claim:contact-handoff`: PASS in desktop and 390 px
  mobile; six exact platform-opener URLs were observed.
- `npm run lint`, `npm run build`, and `npm audit --audit-level=high`: PASS.
  Production output is `dist/site/`; initial JS is 40.85 KB raw / 14.73 KB
  gzip, and CSS is 18.85 KB raw / 5.18 KB gzip.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`, locked
  `cargo check`, and locked `cargo test`: PASS after installing the same Linux
  Tauri prerequisites listed in `.github/workflows/release.yml`. The native
  crate has no unit or doc tests yet (0/0/0 pass).
- Production-preview browser checks: PASS. Factory `verify-url.sh` reported
  HTTP 200, no console/page errors, route titles, `lang=en`, one `h1`, one
  `main`, no image missing alt text, and no unlabeled buttons on `/`, `/demo`,
  `/app.html`, `/privacy`, `/terms`, and `/download`.
- `@axe-core/playwright` scans: PASS on those six routes plus the real 404 in
  desktop and mobile (14 scans; zero serious or critical violations). The
  standalone Axe CLI was also attempted, but its bundled ChromeDriver 152
  cannot start the supplied Playwright Chromium 145; the Playwright Axe
  integration is the equivalent supported check and passed.
- Production-preview keyboard, invalid-link recovery, dialog focus return,
  390 px reflow/touch targets, 200% text, privacy/no-message request capture,
  demo isolation, offline reload, and old-cache-to-new-cache update tests:
  PASS. Two desktop skips remain intentionally mobile-only.
- Mobile Lighthouse against `dist/site/`: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 40 ms, CLS 0, and
  80 KiB total transfer.

## Delivery and operator action

Deploy `dist/site/` with `/opt/fleet/lib/deploy-static.sh presence-bridge
dist/site`; it preserves the existing static deployment class and applies the
repository's CSP, cache, and real-404 configuration. The post-deploy check
must confirm the live service-worker build ID identifies this v0.1.12 source,
then repeat the live route, privacy, offline, and response-header checks.

Tagging `v0.1.12` starts the required GitHub Actions matrix. It produces
macOS DMG/app archive, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`,
and `latest.json`; the workflow then smoke-tests the Windows and Linux
installers. Builds are intentionally unsigned until an operator configures
`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
`WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` as repository secrets.

There are no product-code gaps remaining from verification 8.
