# Independent verification 8 — FAIL

**Requested candidate:** `95c2d009d038ce8ea35659eadb6a8b64cd54122d`

**Obtainable clean work-order base:** `95c2d042fe445a40b05db814cabb1e9e843b1e72`

**Live URL:** https://presence-bridge.sociobot.in

**Verified:** 2026-08-29 from the supplied clean clone

## Decision

**FAIL.** The exact candidate cannot be obtained or tested, and the live site identifies itself as a different commit. The currently obtainable product is otherwise healthy: all 19 declared claim commands, local and production-preview test suites, type and native checks, live workflows, accessibility scans, privacy checks, offline reload, installer checks, and budgets pass.

No product code was changed during verification.

## Release-blocking findings

### P1 — The requested candidate commit does not exist in the supplied repository

The first fetch of the requested object failed:

```text
git fetch origin 95c2d009d038ce8ea35659eadb6a8b64cd54122d
fatal: remote error: upload-pack: not our ref 95c2d009d038ce8ea35659eadb6a8b64cd54122d
```

After `git fetch --all --tags --prune`, `git cat-file -e 95c2d009d038ce8ea35659eadb6a8b64cd54122d^{commit}` still failed. The object was absent from local objects, all advertised branches, and all advertised tags. The supplied clone's `main` and `origin/main` instead pointed to `95c2d042fe445a40b05db814cabb1e9e843b1e72`.

The live service worker reports build `0.1.11-95c2d042fe44`, not the requested candidate. Its HTML and principal assets match a production build of `95c2d042…` byte-for-byte:

| File | Local/live SHA-256 |
| --- | --- |
| `index.html` | `a9b085ca8179b49f98caacc05008a01966fa010dcd252771f3adf2c24fbb612a` |
| `app.html` | `86eb9b3fb241c63653caa0df684ca51c7db38c1b985757afb0a72f134dc26514` |
| `site-BNwacjzW.js` | `ad68828ecdcc90c9fe7d17462bfb9c0c90f002503d9308169a0290f1ae1c41bf` |
| `app-core-DfphdSYd.js` | `0cf138462d928d32edf68619ba8384987f2d277a2d1b5c9a6bba3dd5d802d2b2` |
| `app-core-DATIMoXw.css` | `f021a160c857a84d208c7737673cd77fc0925903c6835ba528e567d1f123d77f` |

The desktop release is also not tied to the requested candidate. Release `v0.1.11` targets `9537d2b3df3521a5a4ceb8bab7dd62538d7b24a7`. Commit `95c2d042…` differs from that release only in `.factory` handoff and evidence files, but neither commit establishes the contents or identity of the missing `95c2d009…` candidate. Candidate-to-live and candidate-to-release identity therefore cannot be proven.

Required repair: publish the exact candidate object on an advertised ref, or issue a work order naming the actual candidate. Redeploy and release that exact commit if its product files differ, then rerun independent verification.

### P1 — The broad contact-tool claim is only tested with Slack

The manifest claims the app opens a saved **chat, call, email, or phone** link, and the README names Slack, Teams, Meet, Zoom, email, and phone. Its sole tagged claim test intercepts and asserts only one `slack://` URL. The unit test covers only `mailto:` and Slack acceptance; it does not exercise Teams, Meet/HTTPS, Zoom, or telephone handoff through the platform opener.

The Slack outcome itself works live, but the test does not prove the complete published claim as required by the claims contract. Narrow the claim to the tested outcome or add observable opener assertions for each advertised link class.

## Mandatory first-read and demo gate — PASS

A cold 1440 × 900 visit with empty storage answers all three questions in the first viewport:

- What: **“See who is free before you message.”**
- Who: small teams that need availability without another chat app.
- First action: **“Try it with sample data”**, beside **“See a five-person roster in one click.”**

The local/privacy, offline, and free-five-person facts are also visible. One click opens `/?demo=1` with Ava Shah, Leo Martin, Noor Okafor, and Mina Park, plus the persistent **“Demo — sample data, nothing is saved”** banner, **Reset demo**, and **Start for real**. There were no console or page errors.

Evidence: [cold first screen](evidence/verification-8/live-cold-desktop.png) and [one-click demo](evidence/verification-8/live-demo-one-click.png).

## Required claims gate — PASS on the obtainable base

`.factory/claims.json` exists with 19 entries. After `npm ci`, every listed command was run separately and exactly as written. Every command passed in both desktop Chromium and the 390 px mobile project:

| Claim | Result |
| --- | --- |
| `contact-handoff` | PASS × 2; coverage defect noted above |
| `privacy-local` | PASS × 2 |
| `transparent-presence` | PASS × 2 |
| `no-message-transport` | PASS × 2 |
| `calendar-local` | PASS × 2 |
| `offline-reload` | PASS × 2 |
| `free-limit` | PASS × 2 |
| `demo-isolation` | PASS × 2 |
| `demo-exit-discard` | PASS × 2 |
| `paid-roster` | PASS × 2 |
| `checkout-availability` | PASS × 2 |
| `license-minimization` | PASS × 2 |
| `json-backup` | PASS × 2 |
| `shared-presence` | PASS × 2 |
| `platform-download` | PASS × 2 |
| `release-checksums` | PASS × 2 |
| `release-fallback` | PASS × 2 |
| `linux-installer` | PASS × 2 |
| `windows-installer` | PASS × 2 |

These results apply to `95c2d042…`, because the requested candidate could not be checked out.

## Clean local and production gates

- `npm ci`: PASS; 67 packages audited, 0 vulnerabilities.
- `npm test`: PASS; 12 Vitest tests and 76 Playwright tests passed; 2 desktop skips are the intentionally mobile-only cases.
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS; exact production output created in `dist/site/`.
- Production-preview Playwright: PASS; 76 passed, 2 intentional skips.
- `npm audit --audit-level=high`: PASS; 0 vulnerabilities.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: PASS.
- `cargo check --manifest-path src-tauri/Cargo.toml --locked`: PASS after installing the Ubuntu Tauri packages declared by the release workflow.
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: PASS; the native crate currently contains 0 unit/doc tests.

The full live suite completed 75 passes and 2 intentional skips before one Chromium process crashed with SIGSEGV while closing the mobile `platform-download` test. The exact test passed immediately in a fresh isolated browser process. This was a browser-process failure, not an application assertion failure.

## End-to-end, boundary, and recovery evidence

Fresh 390 × 844 live checks passed:

- Chosen `away` status remained unchanged after keyboard and pointer activity.
- `/` focused roster search; Arrow Down selected Leo Martin.
- The real app loaded sample data and handed Ava's exact `slack://user?team=T123&id=U100` URL to the browser opener.
- An unsupported `javascript:` contact link kept the entered name, role, note, and link, exposed an inline error, set `aria-invalid`, and focused the field. Correcting only the URL saved the fifth teammate.
- A sixth teammate was rejected with the five-person limit message.
- Malformed calendar and roster files were rejected with actionable messages; existing data remained usable.
- Demo state existed only in `sessionStorage[demo:presence-bridge:v1]`. **Start for real** cleared it and opened an empty real roster.

No request failure, console error, or page error occurred in this flow.

## Privacy, security headers, caching, and API allowance

The full manual demo flow made only same-origin requests to `presence-bridge.sociobot.in`. It sent no analytics, roster, status, calendar, or activity request elsewhere. Real `localStorage` stayed empty while the demo banner was present.

Live responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`, strict-origin referrer policy, and disabled camera, microphone, and geolocation. HTML uses `public, must-revalidate, max-age=30`; the service worker uses `no-cache`; hashed JS/CSS uses `public, max-age=31536000, immutable`.

The documented Sociobot license-verification endpoint allowed 30 sequential invalid-token requests from one client. Request 31 returned **429** with `Retry-After: 3`.

## Accessibility, responsive behavior, and PWA

- Fresh Axe scans of `/`, `/demo`, `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404 at desktop and 390 px found zero serious or critical violations.
- Each route has `lang=en`, one `h1`, one `main`, a route-specific title, no horizontal overflow, and no console/page error on successful pages.
- Keyboard focus uses a visible 3 px high-contrast outline. Search, list arrow navigation, dialogs, Escape focus restoration, and invalid-field focus pass.
- Mobile touch-target, 200% text, and 390 px reflow tests pass.
- With reduced motion, all checked routes reported zero running animations.
- The factory `verify-url.sh` passed home, demo, and app on desktop and mobile.
- A fresh worker controlled `/demo` as `sw.js?build=0.1.11-95c2d042fe44`, with cache `presence-bridge-0.1.11-95c2d042fe44`. Offline reload returned 200 and kept the sample roster visible. Old-worker replacement also passes the live suite.

Evidence is under [`evidence/verification-8`](evidence/verification-8/).

## Performance and bundle budgets

Fresh mobile Lighthouse: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.2 s, TBT 90 ms, CLS 0, total transfer 81,458 bytes.

Production assets remain below contract budgets: initial app/site JS is about 40.3 KB raw / 14.3 KB gzip, CSS is 18,845 bytes raw / 5,190 bytes gzip, and the mobile hero is 30,482 bytes.

## Desktop release and installer

GitHub Actions run `33265037801` completed successfully for release `v0.1.11`. The release contains universal macOS DMG/app archive, Windows MSI/EXE, Linux AppImage/DEB/RPM, `SHA256SUMS`, and valid `latest.json` metadata.

A fresh download of `Presence.Bridge_0.1.11_amd64.deb` matched the published SHA-256 `406faa49b6757bde3e0392fe447cb8e5ebbe8f6b1cfad934301f72ecd812589d`. Package metadata reports `presence-bridge` 0.1.11 for amd64. The live Linux one-line installer downloaded and checksum-verified the AppImage, installed it in an isolated temporary bin directory, and the installed file returned its AppImage runtime version.

At 390 px, `/download` detected Linux and linked the real v0.1.11 AppImage, checksum, and manifest without overflow or console errors. All discovered HTTP links across the live routes returned 200 after redirects.

## Scope notes

There is no sign-in, so the Entra authority check is not applicable. This is not a library, CLI, or standalone backend, so consumer-package, backend health, concurrency, and server persistence checks are not applicable. The product has no runtime AI feature. Desktop packages remain intentionally unsigned pending operator certificates.
