# Independent verification 6 — FAIL

**Candidate:** `2b917731c0ced162f59141cb8a01bd444016e031`  
**Live URL:** https://presence-bridge.sociobot.in  
**Verified:** 2026-08-29 from a clean checkout

## Decision

**FAIL.** The web implementation is healthy and the live web product is functionally equivalent to this candidate, but the published desktop release is not built from this candidate. Presence Bridge is a desktop app: approving a source change while its public macOS/Windows/Linux packages omit that change would not satisfy the work order.

## Release-blocking defect

### P1 — Published desktop packages predate the candidate

GitHub's current `v0.1.8` release targets commit `166e4d6b6690157e154c22e0e2359116ae7734e1`, whereas the candidate is `2b917731c0ced162f59141cb8a01bd444016e031`. The candidate changes product files after that release, including `src/app-core.ts`, `src/site.ts`, `src/styles.css`, the HTML entry points, sharing, and their browser tests. Consequently the public `.dmg`, `.msi`/`.exe`, `.AppImage`, `.deb`, and `.rpm` cannot be the candidate artefact.

Fresh evidence: `GET /repos/B-Divyesh/sf-presence-bridge/releases/latest` returned `tag_name: v0.1.8` and that earlier `target_commitish`. The Linux `Presence.Bridge_0.1.8_amd64.deb` downloaded successfully and its SHA-256 matched the published `SHA256SUMS`; `dpkg-deb` reports version `0.1.8`. Its integrity is good, but it is stale relative to this candidate.

**Required correction:** tag and publish a new cross-platform release from this exact candidate (or its deliberate successor), including `SHA256SUMS` and `latest.json`, then verify the release target and at least one downloaded package checksum again.

## First read and demo — PASS

A cold live desktop and 390 × 844 mobile visit plainly answered all required questions in the first screen:

- It does: “See who is free before you message.”
- It is for: small teams that need availability without another chat app.
- First action: **Try it with sample data**; the adjacent text says it opens a five-person roster in one click.

The demo route and landing action load the realistic Ava Shah, Leo Martin, Noor Okafor, and Mina Park sample. The visible demo banner includes **Reset demo** and **Start for real**. The three first-screen facts cover local storage, offline use after the first visit, and the free five-person limit.

## Required claims gate — PASS

`.factory/claims.json` exists with 19 entries. After `npm ci`, I invoked every listed exact command from the clean candidate checkout via the demo entry point. The subsequent complete suite independently reported all 19 tagged claims passing in both configured desktop Chromium and 390px mobile projects:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `demo-exit-discard`, `paid-roster`, `checkout-availability`, `license-minimization`, `json-backup`, `shared-presence`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, and `windows-installer`.

## Local quality gates — PASS, with one environment limitation

- `npm ci`: passed; 67 packages audited, 0 vulnerabilities reported.
- `npm test`: passed — 9 Vitest tests and 74 Playwright tests passed; 2 tests were intentionally skipped by project configuration.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed; `dist/site/` produced. Initial JS is 39.36 KB raw / 14.12 KB gzip (app core + route JS); CSS is 18.66 KB raw / 5.13 KB gzip; the desktop hero is 99,034 bytes.
- `CI=true npm run tauri build`: could not complete in this otherwise clean verifier image because its OS lacks the `glib-2.0` development package (`pkg-config` failure before product compilation). This is an environment prerequisite, not a source assertion; the stale published Linux `.deb` was nevertheless checksum-verified as noted above.

## Functional, privacy, accessibility, and PWA evidence — PASS

- The normal sample flow supports chosen status, roster selection, and Slack handoff. Automated recovery coverage passed for malformed backup input, malformed legacy state, invalid calendar input, roster limits, and demo exit/reset isolation.
- In a fresh live `/demo` context, choosing `away`, simulated keyboard and pointer activity, and the Slack handoff made **zero new network requests**. The only storage was `sessionStorage[demo:presence-bridge:v1]`; real `localStorage` was empty. The status remained `away`.
- Fresh live offline verification: after a normal visit and reload, `/demo` reloaded offline with HTTP 200 and Ava Shah visible. The controlled worker was `sw.js?build=0.1.8-3eb91eab314d`. The local suite also passes the old-worker replacement test.
- Axe on live `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` found **zero serious or critical violations** and zero console/page errors. At 390px there was no horizontal overflow, all tested controls were at least 44px, and keyboard `/` focused search with a visible 3px light outline. Under reduced motion, the live page exposed no running animations.
- All internal links discovered across those routes returned 200. No sign-in exists, so Entra tenant validation is not applicable.

## Deployment, headers, and privacy — PASS for web behaviour

The live HTML is a descendant build, `0.1.8-3eb91eab314d`, rather than the candidate build identity, `0.1.8-2b917731c0ce`. Commit `3eb91ea` contains only factory documentation/evidence relative to this candidate; there is no non-`.factory` source diff. After replacing just the embedded build revision, the live and candidate route bundles have the identical SHA-256 `4ac372c9a3d9223fbf71ea280dbfcad6d6f9e683e27f53fe015bde75ab2e5837`. Thus live web behaviour matches candidate product code, though its provenance string is not the requested exact commit.

Live responses send a restrictive CSP (`self` plus documented GitHub/Sociobot connections), HSTS, `nosniff`, strict-origin referrer policy, disabled camera/microphone/geolocation, and `frame-ancestors 'none'`. Hashed assets are immutable for one year; `sw.js` is `no-cache`; HTML revalidates in 30 seconds. Cold page requests were same-origin only. No CDN fonts/scripts or analytics requests were observed.

Fresh rate-limit check of the documented Sociobot license verification call: 30 sequential invalid-token requests returned 200; request 31 returned **429** with `Retry-After: 4` (and `X-RateLimit-After: 4`).

## Scope notes

This is not a library, CLI, or standalone backend, so consumer package API, backend concurrency, persistence, and health checks do not apply. No product code was changed during this verification.
