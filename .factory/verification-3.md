# Independent verification 3 — FAIL

**Candidate:** `cb70cced059fdc4797d8fd5e9a260b91e7826d5c`

**Live URL:** https://presence-bridge.sociobot.in
**Verified:** 2026-08-28 from a clean checkout

## Decision

**FAIL.** This is not a deployment-only failure. The live static site exactly matches the candidate's built web assets and its ordinary local-first demo, privacy boundary, offline flow, accessibility automation, and build gates work. It is nevertheless not releasable: live checkout is unavailable; published desktop packages predate the candidate; roster import accepts persistent malformed state that leaves the app blank; and roster import bypasses the advertised five-person free limit.

No product code was modified during verification.

## First read and demo gate — PASS

A cold live desktop page answered all required questions before scrolling:

- **What:** “See who is free before you message.”
- **For whom:** small teams needing availability without moving conversations to another chat suite.
- **First action:** “Try it with sample data,” followed by “See a five-person roster in one click.”

The demo opens in one click, contains named sample colleagues and real-looking availability/handoff data, and shows the persistent **Demo — sample data, nothing is saved** banner with **Reset demo** and **Start for real**. No console or page errors occurred on the cold load.

## Release-blocking defects

### P1 — Bridge Plus checkout is unavailable in production

Fresh evidence:

```text
GET https://api.sociobot.in/api/v1/products/presence-bridge/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The live **Buy Bridge Plus** action cannot start the advertised $24 purchase. The `@claim:one-time-price` test passes against a recorded 302 fixture, so it does not establish the required live outcome.

**Required correction:** enable the product in the live Sociobot billing catalog at the stated price and return URL, then verify a real redirect.

### P1 — The published desktop applications are not the candidate

The live download page selects GitHub release `v0.1.5`. GitHub reports its `target_commitish` as `e83d09d51fcc1c62cc059e81c22b3528eda220a0`, not this candidate `cb70cced059fdc4797d8fd5e9a260b91e7826d5c`. The candidate adds production sharing, validation, site, and workflow changes after that release commit. Thus the downloadable macOS, Windows, and Linux packages omit candidate behavior even though the current web deployment is correct.

**Required correction:** version and tag the repaired candidate, publish a fresh cross-platform release with checksums and `latest.json`, then confirm download selection points to it.

### P1 — A malformed roster backup is accepted, saved, and makes the app unusable after reload

In a fresh real-app browser context, importing this through **Settings → Import backup** was accepted:

```json
{"me":{},"members":[{}]}
```

It persisted to `localStorage`; rendering raised `Cannot read properties of undefined (reading 'replace')`; after reload the page had no `h1` or buttons and its only text was the skip link. The only recovery is clearing all site storage, which also removes the user’s roster.

**Required correction:** schema-validate and normalize every backup before storage, preserve the old state on rejection, and add an import-recovery regression test.

### P1 — Backup import bypasses the advertised free-roster limit

A syntactically valid six-member backup in a fresh unlicensed context produced:

```text
6 PEOPLE
Roster backup imported.
```

This contradicts “The free local roster holds five people.” The `@claim:free-limit` test covers only the add-person dialog, not imports; it is therefore a false positive for the visitor-facing claim.

**Required correction:** apply five/ten-person entitlement validation to every input path, including backups and presence imports, and cover those paths in the tagged claim test.

### P1 — Claims inventory is incomplete for public release promises

The landing/download/README promises release checksums, release metadata/fallback behavior, and installer outcomes. The manifest’s `platform-download` test asserts only a fixture-selected AppImage link. Those other relied-on outcomes, including the one-line installers, have no claim entry and observable sandbox test as required by the claims contract.

## Other defects

### P2 — Calendar-derived presence remains stale while the app remains open

An imported active event ending 2.5 seconds later set status to `Busy · Boundary Meeting`. Four seconds after the end it still read Busy. A reload changed it to `Available · Calendar Is Clear`. Calendar state is recalculated only on import/load/settings save, rather than at event boundaries or resume.

### P2 — Remaining 390px targets below the required 44px minimum

At 390×844, the privacy email link measured 20px high, the terms support email link 20px, and **View all releases on GitHub** 19px. Primary product controls reflowed without horizontal overflow, but these visible touch targets remain below the acceptance baseline.

## Claims and local quality gates

`.factory/claims.json` exists and lists 14 entries. After `npm ci`, each exact declared command `npm test -- --grep @claim:<id>` was run from the clean checkout through the shipped demo/browser entry point. All completed successfully across the configured desktop and 390px mobile projects:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `paid-roster`, `one-time-price`, `license-minimization`, `json-backup`, `shared-presence`, and `platform-download`.

Those passes do not cure the false-positive and unlisted-claim findings above.

Additional clean checks passed:

- `CI=1 npm test`: 7 Vitest tests and the 54-test Playwright suite passed.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed; output at `dist/site/`.
- `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` and `cargo check --locked --manifest-path src-tauri/Cargo.toml`: passed.
- Production preview test suite passed against `http://127.0.0.1:4174`.
- Live accessibility suite completed with no serious/critical Axe findings; one desktop-only mobile-layout case was intentionally skipped. `verify-url.sh` reported 200, 948ms network-idle load, no console errors, title/lang/one `h1`/`main`, no missing image alt text, and no unlabeled buttons.

Built static sizes meet budget: app core JS 22.40 KB raw / 8.06 KB gzip, route JS 10.97 KB raw / 4.38 KB gzip, and CSS 17.33 KB raw / 4.90 KB gzip. Lighthouse was attempted twice in this container but could not complete because the supplied headless Chromium crashed; this did not affect the Playwright checks.

## Deployment, privacy, and operational evidence

- SHA-256 comparisons for `index.html`, `app.html`, `404.html`, `sw.js`, app core JS, route JS, and CSS were all exact matches between `dist/site/` and live.
- `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` returned 200; an unknown route returned the designed 404.
- In the demo flow, captured requests stayed same-origin. No analytics, third-party font, message transport, Azure/OpenAI, or other unexpected runtime request was observed.
- The live CSP, HSTS, `nosniff`, strict-origin referrer policy, and restrictive camera/microphone/geolocation permissions policy were present. HTML is short-revalidated; hashed assets are immutable for one year; `sw.js` is `no-cache`.
- Offline reload after first visit passes in the browser suite, including its service-worker update regression.
- No sign-in is used, so the Entra External ID requirement is not applicable.
- The verification endpoint rate-limit check (60 requests at concurrency 12) returned 30×200 then 30×429. The first observed 429 was request index 14 (completion ordering is concurrent); `Retry-After` was 4 or 3 seconds.

## Required next actions

1. Enable live Sociobot checkout and exercise its redirect.
2. Publish a new versioned desktop release from this repaired candidate.
3. Validate all imports before persistence, maintain the last valid state after rejection, and enforce limits on every import path.
4. Recompute calendar availability at event boundaries and when the app resumes.
5. Add claim entries/tests for every public release, checksum, fallback, and installer promise; extend free-limit coverage to import paths.
6. Raise the remaining mobile link targets to 44px.
