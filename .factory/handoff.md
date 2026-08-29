# Presence Bridge repair handoff

## Status

Repair source commits: `16e9780` (`fix: fail closed when checkout is unavailable`) and `97407ac` (`fix: remove checkout probe console errors`).

Artifact class remains **desktop app**: Tauri 2 with a Vite/TypeScript UI. The static landing site is deployed at `https://presence-bridge.sociobot.in`. This repair is versioned `0.1.8`.

## Release-blocking finding repaired

Independent verification 4 found that the advertised **Buy Bridge Plus** link went directly to the production Sociobot checkout endpoint, which returned:

```text
GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The product now fails closed.

- Landing and app Settings start with an honest unavailable-purchases message, not a broken purchase link.
- The product makes no checkout request while the catalog is unavailable, so the reported 404 cannot produce a browser console error.
- **Buy Bridge Plus** is absent from landing and Settings. A 404, non-redirect response, or unreachable endpoint therefore cannot expose a broken purchase path.
- Existing-license restore and verification, Bridge Plus limits, the free five-person roster, demo isolation, and every previously passed behavior remain unchanged.
- Privacy, terms, README, claims, and the landing copy audit now state the conditional checkout behavior plainly.

## Regression coverage

`@claim:checkout-availability` uses the verifier's exact 404 body on both Chromium desktop and 390px mobile. It asserts that landing and desktop-app Settings show no purchase link and make no request to that endpoint.

`.factory/claims.json` has 18 claims. Each has exactly one tagged test. Every exact command listed in that manifest passed from this checkout.

## Verification

Commands run after a clean install on 2026-08-29:

```sh
npm ci
CI=1 npm test
npm run lint
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
```

Results:

- `npm ci`: PASS — 67 packages audited; 0 vulnerabilities.
- `CI=1 npm test`: PASS — 9 Vitest checks plus all configured desktop and 390px Playwright checks. This covers keyboard search and arrow navigation, dialog Escape focus return, real 404, 44px targets, 200% text, axe serious/critical findings, local-only demo requests, service-worker update retirement, and offline reload.
- Every one of the 18 exact claims-manifest commands: PASS.
- `npm run lint`, `npm run build`, Rust format, and `cargo check --locked`: PASS. The required Linux Tauri development packages were installed before the Rust check.
- Production-preview `verify-url.sh` on `/` and `/demo`: PASS — HTTP 200, no console errors, title/lang/one h1/main, image alt text, and labelled buttons.
- Desktop and 390px production-preview checks: PASS — no Buy link, unavailable state visible, no external request, and no console error.
- Local production-preview Lighthouse mobile: performance **100**, accessibility **100**, LCP **1.7 s**, CLS **0**, total blocking time **50 ms**.
- Static production build: app core JS 25.85 KB raw / 9.14 KB gzip; site JS 11.46 KB raw / 4.53 KB gzip; CSS 17.61 KB raw / 4.96 KB gzip.

## Known external limitation

The Sociobot billing catalog is still not configured to redirect this product to checkout. That external state cannot be changed by this static repository or its deployment. This is no longer a misleading or broken product path: people are told that purchases are unavailable and may still use the free roster or restore an existing license.

To restore paid conversion, an authorized Sociobot billing operator must enable the `presence-bridge` public one-time `$24` product with return URL `https://presence-bridge.sociobot.in/`. The factory can then publish a purchase-enabled release after independently confirming the redirect.

Desktop artifacts remain unsigned until GitHub Actions receives `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.

## Publication evidence

`v0.1.7` was superseded before final publication because its user-initiated checkout probe caused an expected HTTP 404 to be logged as a browser console error.

- GitHub release [`v0.1.8`](https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.8) targets `166e4d6b6690157e154c22e0e2359116ae7734e1`. GitHub Actions run [`33252735238`](https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33252735238) passed macOS universal, Windows, Linux, checksum/manifest generation, Windows installer smoke, and Linux installer smoke.
- The release has macOS `.dmg` and app archive, Windows `.msi` and `.exe`, Linux `.AppImage`, `.deb`, and `.rpm`, plus valid `SHA256SUMS` and `latest.json` with 2 macOS, 2 Windows, and 3 Linux URLs.
- Downloaded `Presence.Bridge_0.1.8_x64_en-US.msi` SHA-256 is `7966ac6b17560771fe13ba6c6230a9ab6f0b9a1b4b129bc2972c0d571e197aea`, exactly matching `SHA256SUMS`. The live download page selected the v0.1.8 Linux AppImage and showed checksum and manifest links with no console errors.
- Azure Static Web Apps deployment `d16e7496-3637-4e08-a644-0af902d60d58` completed successfully. The live site serves build `0.1.8-166e4d6b6690`.
- Live `verify-url.sh` passed for `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html`: every page returned 200 with no console errors, title/lang, one h1, a main landmark, image alt text, and labelled buttons. An unknown route returned a styled real HTTP 404.
- Fresh live desktop and 390px runs showed the unavailable purchase message, zero **Buy Bridge Plus** links, no external request, no console error, and no horizontal overflow. The demo made same-origin requests only and retained its isolated banner.
- Live responses include CSP, HSTS, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive camera/microphone/geolocation permissions policy.
- The external checkout endpoint still returns `404 {"error":"enabled factory product","status":404}`. The product no longer calls or links to it. A fresh 31-request invalid-license probe returned 30×200 then 429 on request 31; the 429 had `Retry-After: 3` and `X-RateLimit-After: 3`.
