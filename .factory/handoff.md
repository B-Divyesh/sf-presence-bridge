# Presence Bridge polish round 1 handoff

## Outcome

All eight findings in `.factory/review-1.md` are resolved. No earlier
`.factory/review-*.md` or `.factory/polish-*.md` files existed in the base
commit. The repaired static site was built from commit
`2b917731c0ced162f59141cb8a01bd444016e031`, deployed successfully, and then
checked cold at <https://presence-bridge.sociobot.in>.

- Work order: `presence-bridge-polish-1`
- Deployment ID: `c267de1b-a247-478f-b409-cd2d66f9a738`
- Azure Static Web Apps status: `Succeeded`
- Custom-domain status: `Ready`
- Live response: HTTPS 200
- Finding map: `.factory/polish-1.md`
- Catalog description: `See who is free, then open the contact tool your team already uses.`

## What changed

- Added the one-click `/?demo=1` sample path and a persistent demo banner with
  Reset demo and Start for real actions.
- Made demo exit discard the demo session immediately. Browser Back starts a
  fresh sample roster, while real roster storage remains untouched.
- Added the `demo-exit-discard` claim and its observable Playwright test.
- Removed the unverified `$24` offer. The site now says Bridge Plus is not
  available in this release.
- Kept Privacy visible at 390 px and fitted all three plain facts inside the
  initial 390 × 844 viewport.
- Completed `/app.html` metadata, home/legal navigation, footer, sitemap entry,
  and responsive layout.
- Added route-specific title, description, canonical, Open Graph, and Twitter
  metadata. History navigation restores heading focus. The styled 404 returns
  status 404 with complete social metadata.
- Rewrote headings and product copy in plain words, standardized on “contact
  tool,” split the long README privacy sentence, and refreshed the copy audit.
- Corrected application landmark nesting found during the final Axe crawl.

The cinematic blue-hour control-room identity, original artwork, Tauri 2
desktop artifact class, release workflow, and existing v0.1.8 platform release
remain intact.

## Verification evidence

All commands below completed successfully from the repaired commit.

- Clean install/build gate: `npm ci && npm test && npm run build:site`
  - Vitest: 9 passed.
  - Playwright: 74 passed, 2 intentional non-Chromium/project skips.
  - `dist/site/` produced.
- Type check: `npm run lint` passed.
- Rust format: `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` passed.
- Rust integration check: `cargo check --locked --manifest-path src-tauri/Cargo.toml` passed after installing the same Linux system packages used by the release workflow.
- Claim gate: a fresh clone at `/tmp/presence-bridge-claims-DObWXN` checked out
  commit `2b917731c0ced162f59141cb8a01bd444016e031`; all 19 exact commands in
  `.factory/claims.json` passed independently.
- Local URL verifier: `/` and `/?demo=1` passed title, language, single-h1,
  main-landmark, alt-text, button-name, load, and console checks.
- Local standalone Axe: 0 violations on `/`, `/demo`, and `/app.html`.
- Live standalone Axe 4.10.3: 0 violations on `/`, `/?demo=1`, `/app.html`,
  `/privacy`, and `/terms`; see `.factory/evidence/polish-1/live-axe.json`.
- Lighthouse against the production build: Performance 100, Accessibility
  100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 30 ms. Evidence:
  `.factory/evidence/polish-1/lighthouse.json`.
- Built bundles: site JavaScript 12.79 kB raw / 4.81 kB gzip; app JavaScript
  26.57 kB raw / 9.31 kB gzip; app CSS 18.66 kB raw / 5.13 kB gzip.
- Live deployed `site-iXOL3ADn.js` SHA-256 matched `dist/site` exactly:
  `7b7bb7f45cf7479e168c65608b0b6dce8e0214a79509224af6946bf0f8b8ecc1`.
- Cold live check at 390 × 844 confirmed visible Privacy, all three facts,
  isolated query-demo storage, discard-on-exit, reset-on-Back, offline reload,
  route metadata, legal links, real 404, and no unexpected console errors.
  The demo flow contacted only `https://presence-bridge.sociobot.in`.
  Evidence: `.factory/evidence/polish-1/live-check.json` and the live screenshots
  in that directory.

## Run and verify

```sh
npm ci
npm test
npm run lint
npm run build:site
npm run preview
```

Open `http://localhost:4173/?demo=1` for a clean sample roster. Run any exact
claim command from `.factory/claims.json` against the production build.

## Known gaps

None for the review or acceptance scope.

Published desktop packages are intentionally unsigned until the owner provides
the signing credentials already named by `.github/workflows/release.yml`:
`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
`APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and
`WINDOWS_CERT_PASSWORD`. This does not affect the static-site repair.
