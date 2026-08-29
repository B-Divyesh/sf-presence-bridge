# Presence Bridge repair 6 handoff

## Result: PASS

**Finding source:** report commit `88a9b35073aed942def5c68f48c4b4b44fcc68fa`

**Rejected candidate:** `f6e635b2b60636e03446cd0e315ec51ddfa5fbbb`

**Repair commit and release tag:**
`9537d2b3df3521a5a4ceb8bab7dd62538d7b24a7` / `v0.1.11`

**Live URL:** https://presence-bridge.sociobot.in

The sole release-blocking finding in
[`verification-7.md`](verification-7.md) is repaired. Unsupported contact URLs
no longer rebuild the add-person dialog. The current form remains mounted, all
entered values remain intact, and the URL field receives an inline error,
`aria-invalid`, associated help via `aria-describedby`, and focus. Correcting
only that URL now saves the person with the original name, role, note, and tool.

The existing visual system, researched scope, demo sandbox, local storage,
offline behavior, billing boundary, and previously passing behavior are
unchanged.

## Exact regression coverage

`tests/e2e/accessibility.spec.ts` reproduces the verifier's failure in every
Playwright project: desktop Chromium and the 390 px mobile project. It enters
`Quinn Test`, `Support`, `Ready now`, `Support chat`, and
`javascript:alert(1)`, then asserts:

- the dialog and every submitted value remain after rejection;
- the exact inline error is visible inside the dialog and viewport;
- the link has `aria-invalid="true"` and describes the inline error;
- focus returns to the contact-link field;
- the global toast remains empty;
- the inline error is the topmost element at its centre;
- Axe reports no serious or critical issue in the error state;
- changing only the URL to `https://example.com/support` saves the original
  name, role, note, and tool.

Fresh 390 px production evidence is
[`invalid-contact-recovery-mobile.png`](evidence/repair-6/invalid-contact-recovery-mobile.png).

## Clean verification

Run from the repaired tree:

- `npm ci`: passed; 67 packages audited, 0 vulnerabilities.
- Every one of the 19 exact commands in `.factory/claims.json`: passed in both
  browser projects.
- `npm test`: passed; 12 Vitest tests and 76 Playwright tests, with the two
  expected desktop skips for mobile-only cases.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/site/`.
- Production-preview Playwright: 76 passed, 2 expected skips.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo check --manifest-path src-tauri/Cargo.toml --locked`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: passed.
- `CI=true npx tauri build --bundles appimage`: passed; the local AppImage
  launches for its version check. Local `.deb` and `.rpm` builds also passed.
- `/opt/fleet/lib/verify-url.sh` passed on home, demo, and app routes locally
  and live, with no console or page errors.
- The complete live Playwright suite passed: 76 passed, 2 expected skips.

The browser suite covers desktop, 390 px mobile, keyboard operation, route
history, 200% text, 44 px targets, visible focus, Axe, demo isolation, privacy
requests, malformed data recovery, offline reload, and service-worker update.
Every principal page has zero serious or critical Axe findings. Reduced-motion
tests report no running animations. The 390 px pages have no horizontal
overflow.

The live flow sends no product-data request outside the declared boundaries.
Demo state remains isolated in `sessionStorage[demo:presence-bridge:v1]` and is
discarded on exit. The live license verifier allowed 30 sequential requests;
request 31 returned `429` with `Retry-After: 3`.

## Build and performance evidence

- Initial JavaScript: 40,862 bytes raw, about 14.7 KB gzip.
- CSS: 18,845 bytes raw, about 5.2 KB gzip.
- Mobile hero: 30,482 bytes.
- Live Lighthouse mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 50 ms, CLS 0.
- The live hashed JavaScript and CSS match the local production build
  byte-for-byte. The live UI embeds `0.1.11-9537d2b3df35`.

Screenshots, URL verifier output, saved HTML, and the Lighthouse report are in
[`evidence/repair-6`](evidence/repair-6/).

## Deployment and release

`dist/site` from the repair commit was deployed with the work order's static
deployment configuration to Azure Static Web App `sf-presence-bridge`.
Deployment id: `159562cb-c4a1-4023-a8aa-63cf2363398a`.

Live routes `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html`
return 200. A missing route returns the styled 404. HTML revalidates after 30
seconds, hashed assets are immutable for one year, and `sw.js` is `no-cache`.
CSP, HSTS, `nosniff`, strict-origin referrer policy, and disabled camera,
microphone, and geolocation policies are present.

GitHub Actions run
[`33265037801`](https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33265037801)
succeeded for universal macOS, Windows, Linux, manifest generation, and Linux
and Windows installer smoke tests. Release
[`v0.1.11`](https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.11)
targets the exact repair commit. It publishes two macOS, two Windows, and three
Linux packages, plus `SHA256SUMS` and `latest.json`.

A fresh download of `Presence.Bridge_0.1.11_amd64.deb` matched its published
SHA-256:
`406faa49b6757bde3e0392fe447cb8e5ebbe8f6b1cfad934301f72ecd812589d`.
Package metadata reports `presence-bridge` 0.1.11 for amd64. At 390 px, the
live download page selects the real v0.1.11 AppImage without console errors.

Machine-readable release and response-policy evidence is in
[`release.json`](evidence/repair-6/release.json) and
[`live-policy.json`](evidence/repair-6/live-policy.json).

## Known gaps and operator action

No release-blocking product gap remains. The desktop packages are intentionally
unsigned until the operator supplies `APPLE_CERTIFICATE`,
`APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and
`WINDOWS_CERT_PASSWORD`. There is no updater manifest because the app does not
implement automatic updates.
