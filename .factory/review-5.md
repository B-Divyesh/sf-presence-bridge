# Presence Bridge review 5 — See who is free before you message

**Verdict: PASS**

**Finding count:** 0  
**Untested claim count:** 0  
**Live URL:** <https://presence-bridge.sociobot.in>  
**Implementation candidate reviewed:** `139af5f781620c28a3e236ada546ad81101dc135`  
**Released product-code commit:** `992682353261f38d2bd3be260dbbba132ea72dbf` (`v0.1.22`)  
**Documentation baseline:** `f1019919a1f3ded575c76f8e67699d4847a42a13`

## Decision

**PASS.** There are no P0, P1, P2, or P3 findings and no untested public claims. The candidate is reachable. Its only changes after the released product-code commit are evidence and handoff files, so the live implementation comparison is against `9926823…`. A fresh build of the candidate matched all 24 publicly served files byte-for-byte.

## Job, audience, and first action

The job is to see a teammate's chosen availability and open the team's existing contact tool. It is for small teams that do not want another chat inbox. On fresh desktop and 390 × 844 phone visits, before scrolling, the page says “See who is free before you message,” names small teams, and offers **Try it with sample data** with the result stated beside it.

All three facts fit in the untouched first viewport. The final fact bottom was 879 px of 900 px on desktop and 668 px of 844 px on phone.

## Demo, paths, and privacy

- One click opened the realistic four-person roster: Ava Shah, Leo Martin, Noor Okafor, and Mina Park.
- The persistent label read “Demo — sample data, nothing is saved” and included **Reset demo** and **Start for real**.
- A demo status change wrote only `demo:presence-bridge:v1` in session storage. Real local storage remained empty. Reset removed the demo key and restored the sample. Start for real also left both storage namespaces empty.
- Fresh live request capture during this flow made only same-origin requests. No tracker, payment, or roster upload request occurred.
- Normal behavior, rejected `javascript:` contact input recovery, free-limit boundary, keyboard list navigation, focus return, route focus, reduced motion, 200% text, offline reload/update, and the deliberate HTTP 404 all passed in the live suite.

## Claims and quality gates

From a clean detached checkout of the candidate, after `npm ci`, every command declared in `.factory/claims.json` was invoked literally. All 26 passed:

`contact-handoff`, `privacy-local`, `transparent-presence`, `no-message-transport`, `calendar-local`, `offline-reload`, `free-limit`, `demo-isolation`, `demo-exit-discard`, `demo-seed-and-first-view`, `paid-roster`, `checkout-availability`, `license-minimization`, `license-restore`, `status-note`, `json-backup`, `shared-presence`, `shared-folder-refresh`, `release-platforms`, `signing-configuration`, `no-payment-runtime`, `platform-download`, `release-checksums`, `release-fallback`, `linux-installer`, and `windows-installer`.

The complete local gate passed: `npm run lint`; `npm run audit:copy`; `npm test` (15 unit and 94 browser tests); `npm run build`; `npm audit --audit-level=high`; and candidate provenance verification. The complete test suite also passed against the live URL. Playwright's axe integration reported no serious or critical issues on home, demo, legal, download, app, and missing routes in desktop and mobile projects. The route verifier found correct titles, language, main landmark, image alternatives, labeled controls, and no console or page errors on all six real routes. The missing route correctly returned 404.

After installing the documented Linux Tauri prerequisites, `cargo fmt --check`, locked `cargo check`, locked `cargo test`, and warnings-denied `cargo clippy` passed. The native test `shared_folder_reads_only_bounded_presence_files` passed.

## Live deployment and desktop release

- Fresh `dist/site` comparison: 24/24 served files matched the live bytes. `staticwebapp.config.json` is build configuration and intentionally not served.
- The live site has route-specific titles, legal pages, designed 404, CSP, HSTS, nosniff, strict referrer policy, and permissions policy. A seven-route link crawl found no broken required link. The sole 404 was the expected missing-route skip link.
- Release `v0.1.22` points to `9926823…`; `latest.json` is valid and names macOS, Windows, and Linux assets. GitHub reports all six build, manifest, and installer-smoke jobs successful.
- A fresh downloaded Debian package matched published SHA-256 `749ed9326327822f18ec1be01151589bad99f05e5cad33823e1ca69269693e92`. Extracted into a clean temporary consumer location, its native `--smoke-opener` run accepted all six documented contact URL schemes.

## Earlier finding disposition

All 26 findings from reviews 1–4 were inspected against current source, current claims, and the live product. None regressed.

| Earlier findings | Current disposition |
| --- | --- |
| F-1-1 through F-1-8 | Fixed: demo exit isolation; unsupported price removal; mobile Privacy and facts; app metadata; route metadata and real 404; plain contact-tool copy; README sentence audit. |
| F-2-1 through F-2-5 | Fixed: visible one-click sample; expanded executable claims; complete copy audit; explicit action verbs; opt-in native shared-folder refresh. |
| F-3-1 through F-3-8 | Fixed: license and note claims; license deletion wording; unsupported merchant claim removed; consistent “demo” and “browser app” terms; direct sharing and release wording. |
| F-4-1 through F-4-5 | Fixed: serialized and isolated Playwright state; expanded local-data and tracker claims; removed decorative and subjective copy. The full local and live suites passed in this review. |

## Scope

This is a local-first static site and Tauri desktop app with no product-owned backend, tenant, health endpoint, or rate limit. Backend-specific tenant-isolation, restart-persistence, and 429 checks do not apply. The optional billing verifier is covered by the declared license-minimization and no-payment-runtime claims.

