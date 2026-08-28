# Presence Bridge handoff

## Shipped in v0.1.1

- Tauri 2 desktop shell with a persistent tray icon, hide-on-close behavior, and native contact-link opening.
- Local roster with manual status, notes, search, keyboard navigation, add/edit/remove flows, JSON backup and restore, and a first-run sample project.
- Local `.ics` import that marks the owner busy during a current calendar event. The app makes calendar-derived status explicit.
- Configurable, protocol-checked handoffs for email, HTTPS, Slack, Teams, Zoom, and phone links.
- Free tier for five people and one route each. Bridge Plus is $24 once and enables ten people plus a second route.
- Sociobot checkout, return-token capture, daily-cached verification, and license restore by paste. The free app never waits on billing.
- Isolated `/demo` with realistic sample data, reset, start-for-real, and the `demo:presence-bridge:v1` session namespace.
- Responsive landing, demo, download, privacy, terms, desktop app, and styled 404 routes.
- Offline service worker, route metadata, social image, favicon set, security headers, sitemap, and platform-aware release download fallback.
- GitHub Actions release matrix for universal macOS, Windows, and Linux Tauri packages, followed by `SHA256SUMS` and `latest.json`.

## Visual system

The visual thesis is in `.factory/design.md`. The original cinematic blue-hour studio image was generated with `/opt/fleet/lib/gen-image.sh` using the factory image deployment on 2026-08-28. The 2.2 MB source and prompt provenance are in `assets/src/`. Shipped WebP derivatives are 97 KB at 1536px and 30 KB at 768px. Three product walkthrough frames are derived from the running app.

## Run and verify

```sh
npm ci
npm test
npm run build:site
npx tsc --noEmit
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml
```

Results on 2026-08-28:

- Unit tests: 3 passed.
- Playwright: 30 passed across desktop Chromium and a 390×844 mobile profile.
- Axe: zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the 404 route.
- Browser console: no errors on those routes.
- Claims: all seven entries in `.factory/claims.json` passed from fresh demo contexts.
- TypeScript: passed with no emit.
- Rust: `cargo fmt --check` and `cargo check` passed.
- Dependency audit: zero npm vulnerabilities.
- Static build: passed; output is `dist/site/` with `index.html` at its root.
- Initial application JavaScript: 19.41 KB raw / 7.20 KB gzip. Route JavaScript: 10.73 KB raw / 4.28 KB gzip.
- CSS: 16.76 KB raw / 4.80 KB gzip. Largest shipped hero: 97 KB.

Lighthouse mobile, run against the production build:

- Performance: 99
- Accessibility: 100
- Largest Contentful Paint: 1.7 s
- Cumulative Layout Shift: 0
- Total Blocking Time: 70 ms

## Deployment

Static deploy command: `npm run build:site`

Static deploy directory: `dist/site`

The desktop workflow runs on `v*` tags or manual dispatch. The site reads the CORS-enabled GitHub releases API, caches successful metadata for one hour, and shows a release-page fallback while assets are unavailable.

## Known gaps

- The optional encrypted multi-device roster relay is not part of v0.1.0. This release delivers the brief's local roster and manual/calendar-derived presence without pretending local entries are live remote signals.
- Deep-link success depends on the matching external app being installed and accepting its documented scheme.
- Calendar import reads a selected `.ics` snapshot. It does not poll a calendar provider.

## Needs operator action

- Register `presence-bridge` in the Sociobot live billing catalog with a $24 one-time price and a return URL on `presence-bridge.sociobot.in`.
- Add `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, and `APPLE_SIGNING_IDENTITY` to sign and notarize macOS builds.
- Add `WINDOWS_CERT_PFX` and `WINDOWS_CERT_PASSWORD` to sign Windows builds. The workflow maps `WINDOWS_CERT_PFX` to the certificate variable used by the Tauri action.
- Until those secrets exist, releases remain functional but unsigned. The download page states this clearly.
