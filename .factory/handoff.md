# Presence Bridge repair handoff

## Status

Repair source commit: `16e9780` (`fix: fail closed when checkout is unavailable`).

Artifact class remains **desktop app**: Tauri 2 with a Vite/TypeScript UI. The static landing site remains the deployment at `https://presence-bridge.sociobot.in`. This repair is versioned `0.1.7`; release and static-deployment evidence is appended below after publication.

## Release-blocking finding repaired

Independent verification 4 found that the advertised **Buy Bridge Plus** link went directly to the production Sociobot checkout endpoint, which returned:

```text
GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The product now fails closed.

- Landing and app Settings start with an honest unavailable-purchases message, not a broken purchase link.
- A person must explicitly choose **Check whether Bridge Plus is available**. The check sends a `GET` with no request body, roster, calendar, activity, or license data.
- **Buy Bridge Plus** is rendered only if the billing endpoint returns a redirect. A 404, non-redirect response, or unreachable endpoint never exposes the link.
- Existing-license restore and verification, Bridge Plus limits, the free five-person roster, demo isolation, and every previously passed behavior remain unchanged.
- Privacy, terms, README, claims, and the landing copy audit now state the conditional checkout behavior plainly.

## Regression coverage

`@claim:checkout-availability` reproduces the verifier's exact 404 body on both Chromium desktop and 390px mobile. It asserts no purchase link before or after that 404, asserts that the request is bodyless `GET`, asserts a recorded 302 exposes the link, and repeats the 404 assertion in desktop-app Settings.

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
- Local production-preview Lighthouse mobile: performance **100**, accessibility **100**, LCP **1.7 s**, CLS **0**, total blocking time **40 ms**.
- Static production build: app core JS 26.78 KB raw / 9.43 KB gzip; site JS 12.59 KB raw / 4.84 KB gzip; CSS 17.61 KB raw / 4.96 KB gzip.

## Known external limitation

The Sociobot billing catalog is still not configured to redirect this product to checkout. That external state cannot be changed by this static repository or its deployment. This is no longer a misleading or broken product path: people are told that purchases are unavailable and may still use the free roster or restore an existing license.

To restore paid conversion, an authorized Sociobot billing operator must enable the `presence-bridge` public one-time `$24` product with return URL `https://presence-bridge.sociobot.in/`. Once it returns a redirect, the shipped conditional check will show **Buy Bridge Plus** without another code change.

Desktop artifacts remain unsigned until GitHub Actions receives `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.

## Publication evidence

Pending the `v0.1.7` GitHub Actions release and Static Web Apps deployment. This section will record their exact run/deployment identifiers, live browser checks, headers, checksum, and post-deploy checkout result.
