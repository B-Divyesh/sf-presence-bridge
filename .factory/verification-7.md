# Independent verification 7 — FAIL

**Candidate:** `f6e635b2b60636e03446cd0e315ec51ddfa5fbbb`

**Live URL:** https://presence-bridge.sociobot.in

**Verified:** 2026-08-29 from a clean checkout

## Decision

**FAIL.** The previous deployment-only blocker is repaired: the live web build
identifies itself as this candidate, and the current desktop release contains
the same product source. All declared claims, automated tests, builds, release
checks, privacy checks, and accessibility scans pass. A fresh manual invalid-
input check found one release-blocking defect in the core add-person flow.

No product code was changed during this verification.

## Release-blocking defect

### P1 — Contact-link validation erases the form and hides its error on mobile

Fresh live reproduction at 390 × 844:

1. Open `/demo`, choose **Add person**, and enter `Quinn Test`, `Support`,
   `Ready now`, and the unsupported link `javascript:alert(1)`.
2. Choose **Save person**.
3. The app rejects the link, but replaces the dialog. Name, role, and note
   become empty; the link becomes the default `mailto:`. Focus moves to
   **Close**, not the invalid link.
4. The error says “Enter a name and a supported contact tool link, such as
   mailto: or https.” However, the toast is behind the native modal. Its centre
   is covered by `.dialog-actions`, so most of the message cannot be read.
5. Correcting only the link fails again because the previously valid name was
   silently erased. Re-entering every field does eventually save the person.

Measured live geometry: the toast was at `(97.5, 700.8)`, size `195 × 123.2`;
the modal was at `(19, 46.6)`, size `352 × 750.8`. `elementFromPoint()` at the
toast centre returned the dialog action row. Evidence:
[`invalid-contact-fields-erased.png`](qa-artifacts/invalid-contact-fields-erased.png).

This is release-blocking because invalid contact links are a normal safety
boundary, and the required recovery path loses the user's input while hiding
the only explanation. Preserve the submitted values, show and associate an
inline error with the link (`aria-invalid`/`aria-describedby`), focus that
field, and add desktop/mobile regression coverage.

## First read and demo — PASS

A cold live visit at 1440 × 900 and 390 × 844 answers the three required
questions in the first screen:

- What it does: “See who is free before you message.”
- Who it is for: small teams that need availability without another chat app.
- What to do first: **Try it with sample data**, beside “See a five-person
  roster in one click.”

One click opened the realistic Ava Shah, Leo Martin, Noor Okafor, and Mina Park
roster. The demo visibly includes **Demo — sample data, nothing is saved**,
**Reset demo**, and **Start for real**. All three privacy/offline/free facts fit
in the initial 390px viewport.

## Required claims gate — PASS

`.factory/claims.json` exists with 19 entries. After `npm ci`, I invoked every
listed `test` command separately and exactly as written. All passed in both the
desktop Chromium and 390px mobile projects:

`contact-handoff`, `privacy-local`, `transparent-presence`,
`no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`,
`demo-isolation`, `demo-exit-discard`, `paid-roster`,
`checkout-availability`, `license-minimization`, `json-backup`,
`shared-presence`, `platform-download`, `release-checksums`,
`release-fallback`, `linux-installer`, and `windows-installer`.

The live full suite repeated the claim paths successfully. No unlisted public
claim requiring a separate release blocker was found.

## Clean local gates — PASS

- `npm ci`: passed; 67 packages audited, 0 vulnerabilities.
- `npm test`: passed; 12 Vitest tests and 74 Playwright tests passed. The two
  skips are the intentionally mobile-only cases in the desktop project.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`: passed.
- `cargo check --manifest-path src-tauri/Cargo.toml --locked`: passed after
  installing the documented Linux Tauri development packages.
- `cargo test --manifest-path src-tauri/Cargo.toml --locked`: passed; the shell
  currently has no Rust unit or doc tests.
- Initial JS is 39.9 KB raw / 14.5 KB gzip in total. CSS is 18.7 KB raw /
  5.1 KB gzip. The mobile hero is 30,482 bytes.

## Functional, privacy, accessibility, and PWA evidence

- `PLAYWRIGHT_BASE_URL=https://presence-bridge.sociobot.in npm run test:e2e`:
  74 passed, 2 intentional project skips. This covered normal status/roster
  use, handoff, free and paid boundaries, malformed backup recovery, calendar
  boundaries, demo isolation, route history, and offline update behavior.
- The fresh manual demo flow changed status, simulated keyboard/pointer use,
  rejected then recovered from a bad link, added a fifth teammate, reset, and
  left the demo. The selected `away` status did not change from activity;
  reset restored four people; Start for real opened an empty real roster.
- The full request log for that flow contained only
  `presence-bridge.sociobot.in`; there were no failed requests, console errors,
  or page errors. Demo data used only
  `sessionStorage[demo:presence-bridge:v1]`; local storage stayed empty and the
  demo key disappeared on exit.
- Playwright Axe found zero serious/critical violations on `/`, `/demo`,
  `/privacy`, `/terms`, `/download`, `/app.html`, and the styled 404, on both
  projects. Keyboard search, arrow navigation, Escape/focus return, 200% text,
  44px mobile targets, and visible 3px focus rings passed. The P1 dialog error
  behavior above is a manual form-error failure that Axe does not detect.
- Reduced-motion emulation reported zero running animations. The 390px page
  had zero horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed for home, demo, and app: each had a
  title, `lang=en`, one h1, one main, complete image alternatives, named
  buttons, and no console/page errors.
- Service-worker upgrade/cache retirement and offline reload passed live. A
  fresh context registered `sw.js?build=0.1.10-f6e635b2b606` and used cache
  `presence-bridge-0.1.10-f6e635b2b606`.
- Fresh mobile Lighthouse: Performance 97, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 190 ms, CLS 0, 132,965 transferred
  bytes over 11 requests.

## Deployment, release, headers, and API allowance

- Live `index.html`, `app.html`, `app-core-DJ314mUU.js`,
  `site-mtemra_k.js`, and `app-core-ooOGzylh.css` match this candidate's
  production files byte-for-byte. The live worker embeds the exact candidate
  build id.
- GitHub release `v0.1.10` targets
  `a78e58587bab4e4c23a4aa7fa15dae4e59df649d`. The candidate differs from that
  release commit only in `.factory` evidence and handoff documentation; the
  non-`.factory` product diff is empty.
- Release workflow `33260656884` succeeded for macOS universal, Windows, Linux,
  manifest generation, Windows installer smoke, and Linux installer smoke.
  The release contains two macOS, two Windows, and three Linux packages plus
  `SHA256SUMS` and `latest.json`.
- A fresh download of `Presence.Bridge_0.1.10_amd64.deb` passed the published
  SHA-256 check. Package metadata reports `presence-bridge` 0.1.10, amd64.
- All crawled live links returned 200 after redirects, excluding expected
  `mailto:` schemes and the deliberately tested 404 route. The detected Linux
  button resolves to the published AppImage.
- HTML is `max-age=30, must-revalidate`; hashed assets are immutable for one
  year; `sw.js` is `no-cache`. Responses include CSP, HSTS, `nosniff`, strict-
  origin referrer policy, and disabled camera/microphone/geolocation.
- The license verification API allowed 30 sequential invalid-token requests.
  Request 31 returned **429** with `Retry-After: 4` and
  `X-RateLimit-After: 4`.
- No sign-in exists, so the Microsoft Entra tenant requirement is not
  applicable. This is not a library, CLI, or standalone backend.

## Defects by severity

- **P1:** Contact-link validation erases all entered form data, hides the error
  behind the modal on mobile, and moves focus away from the invalid field.
- **P2:** None.
- **P3:** None.
