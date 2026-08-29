# Presence Bridge — polish round 2 handoff

## Result

**PASS.** Every finding in `.factory/review-1.md` and `.factory/review-2.md` is fixed and reverified. The product repair is commit `16aff877e2b476fe9278cdde31638cb952aa791a`, tagged `v0.1.18`, and deployed at <https://presence-bridge.sociobot.in>.

The exact finding-by-finding record is `.factory/polish-2.md`.

## What changed

- Reworded the first-screen promise to “See four sample teammates and your status in one click.”
- Compressed the phone demo layout so Ava and Leo appear before 844 px, with the persistent demo banner and current status still visible.
- Kept `?demo=1` isolated in session storage. Reset, Start for real, Back, and close/reopen discard edits and restore the shipped sample.
- Expanded `.factory/claims.json` from 19 to 24 entries. Every entry has exactly one tagged test, enforced by a contract test.
- Added claim coverage for the mobile sample view, full demo disposal, three-platform release workflow, conditional signing, no payment runtime, and watched-folder refresh.
- Generated `.factory/copy-audit.md` from rendered landing content and README prose. A browser test fails on any drift.
- Changed visible noun-only actions to “Open settings” and “Open {contact tool}.”
- Added the desktop-only, opt-in shared-folder watcher. It reads bounded `.presence.json` files, imports only newer updates, displays update times, marks day-old entries stale, polls every five seconds, and can stop watching.
- Preserved the blue-hour studio, warm-window status lights, clipped panels, brass rules, typography, and motion policy documented in `.factory/design.md`.
- Updated `.factory/catalog-description.txt` to: “Check who is free, then open the contact tool your team already uses.”

## Verification

### Clean clone and claims

Clean clone: `/tmp/presence-bridge-claims-FAOUNW` at `16aff877e2b476fe9278cdde31638cb952aa791a`.

- `npm ci`: passed.
- Every exact command in `.factory/claims.json`: **24/24 passed** independently. Evidence: `.factory/evidence/polish-2/clean-claims.json`.
- `npm test`: **14 Vitest passed; 88 Playwright passed; 2 desktop-project skips were intentionally mobile-only**.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/site/`.
- `npm run audit:copy`: passed.
- `npm audit --audit-level=high`: passed with no high-severity issue.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed.
- `cargo test --locked --manifest-path src-tauri/Cargo.toml`: passed, including `reads_only_bounded_presence_files`.

The production build emits 19.49 KB CSS (5.31 KB gzip), 30.63 KB shared JavaScript, and 12.81 KB site JavaScript, below the product budgets.

### Accessibility, privacy, offline, and browser behavior

- The full Playwright suite also ran against the deployed origin: **88 passed, 2 intentional skips**.
- Playwright Axe reported zero serious or critical violations across `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404.
- `/opt/fleet/lib/verify-url.sh` passed the live home, demo, and app routes: correct title/lang, one h1, main landmark, alt text, button names, and no unexpected console error.
- Cold live 390 × 844 check: all three first-screen facts end by 667.45 px; Ava ends at 568.69 px and Leo at 666.66 px; no horizontal overflow.
- The cold landing-to-demo flow contacted only `https://presence-bridge.sociobot.in`. The real roster key remained null.
- A fresh service-worker context reloaded `/demo` offline with the sample roster intact.
- Reset restored `available`; Start for real removed demo state; Browser Back recreated the original sample.
- `/privacy`, `/terms`, `/download`, and `/app.html` returned 200 with distinct titles and canonicals. An unknown deep link returned the designed page with HTTP 404 and a working return link.
- Live Lighthouse mobile: **Performance 100, Accessibility 100, Best Practices 100, SEO 100**; LCP 1.21 s, CLS 0, TBT 18.5 ms, transfer 149,378 bytes. Evidence: `.factory/evidence/polish-2/lighthouse-live.json`.

Browser evidence is under `.factory/evidence/polish-2/`, including `live-browser-check.json`, `live-mobile-first-screen.png`, `live-mobile-demo-first-view.png`, and the three `live-verify-*` directories.

### Release and deployment

- Static site built with `npm run build:site` and deployed through `/opt/fleet/lib/deploy-static.sh presence-bridge dist/site`.
- Custom domain returned HTTP 200 with managed TLS after deployment.
- Live `index.html`, service worker, CSS, and both main JavaScript files match the deployed local build byte-for-byte. Evidence: `.factory/evidence/polish-2/live-local-hashes.tsv`.
- GitHub Actions release run: <https://github.com/B-Divyesh/sf-presence-bridge/actions/runs/33280817377>.
- Release: <https://github.com/B-Divyesh/sf-presence-bridge/releases/tag/v0.1.18>.
- The tag, release target, and `latest.json.source_commit` identify `16aff877e2b476fe9278cdde31638cb952aa791a`.
- The release publishes macOS, Windows, AppImage, Debian, and RPM packages plus `SHA256SUMS` and `latest.json`. One published Linux package was downloaded and verified against `SHA256SUMS`.
- The cold live download page detected Linux and linked the `v0.1.18` AppImage, `SHA256SUMS`, and `latest.json` without a console error. Evidence: `.factory/evidence/polish-2/live-download-check.json`.

## Run locally

```sh
npm ci
npm test
npm run lint
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path src-tauri/Cargo.toml
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

Open `http://localhost:4173/?demo=1` after `npm run dev` for the isolated sample.

## Operator action

- macOS and Windows packages are unsigned unless the owner supplies `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD` to GitHub Actions.
- Bridge Plus checkout remains unavailable because the external Sociobot product is not registered. The UI shows no dead purchase link, and the free five-person roster remains complete.

Known product or review defects: **none**.
