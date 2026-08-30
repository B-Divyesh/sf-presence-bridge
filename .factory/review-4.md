# Adversarial first-read review 4 — Presence Bridge

**Reviewed:** 2026-08-30

**Live target:** <https://presence-bridge.sociobot.in>

**Repository commit:** `8146a2719b07e6fd7b9df007588a975ff5290889`

**Verdict:** **FAIL**

**Findings:** 1 blocking · 4 minor

The cold read, one-click demo, storage isolation, all 26 exact claim commands,
offline behavior, routing, link crawl, accessibility checks, and visual-identity
checks pass. The product cannot pass this round because the required `npm test`
gate fails reproducibly in a clean clone. Four smaller copy and claims-registry
gaps also remain. A PASS requires zero findings.

## Cold first read

I opened `/` without prior storage in fresh Chromium contexts at 390 × 844 and
1440 × 900. I did not scroll before recording these answers:

- **What it does:** Shows a small team's chosen availability before I open the
  contact tool they already use.
- **For whom:** Small teams that do not want another chat app.
- **What to click first:** **Try it with sample data**.

The exact first-screen copy that supplied those answers was **“See who is free
before you message”**, **“For small teams that need availability without moving
every conversation into another chat app”**, and **“Try it with sample data.”**
The adjacent line says the click shows four sample teammates and the visitor's
status. All three privacy, offline, and free-limit facts were visible before the
fold at both sizes. Both contexts stayed at `scrollY = 0`, matched the viewport
width, made only same-origin requests, and logged no console or page errors.

This gate passes.

## Findings

### F-4-1 — BLOCKING — The required `npm test` gate crashes reproducibly

**Exact location and evidence:** From a clean clone of
`8146a2719b07e6fd7b9df007588a975ff5290889`, I ran `npm test` twice. Both runs
ended with **“1 failed · 2 skipped · 91 passed”** and exit code 1. The failed
case was:

> `[mobile] @claim:release-checksums shows the checksum and manifest shipped with a release`

The immediate error was:

> `browser.newContext: Target page, context or browser has been closed`

In both runs, the mobile Chromium headless-shell process received
`SIGSEGV / SEGV_MAPERR` just before that test's fixture context was created.
This was not a failed product assertion: the exact registered command
`npm test -- --grep @claim:release-checksums` passed independently, as did all
25 other exact claim commands. The full required gate nevertheless fails twice
at the same point.

**Why this blocks:** The product contract requires `npm test` to pass locally.
A verifier cannot distinguish a product regression from a dead browser after
the suite has run, and the claim result is unavailable in the required full
gate. A repeatable runner crash is a release-blocking test-suite defect even
when the isolated assertion passes.

**Concrete fix:** Make the offline and service-worker cases follow the claims
contract literally: create their contexts with `browser.newContext()` inside
each test, restore/close only those contexts in `finally`, and never leave the
Playwright-managed fixture context offline. If Chromium 1208 still crashes,
run the mobile release/download group in a fresh Playwright project or process
so it does not inherit the long-lived browser worker used by the offline cases.
Keep CI on the exact `npm test` command and require repeated clean-clone passes;
do not treat the per-claim grep runs as a substitute for the full gate.

### F-4-2 — MINOR — Device-only “settings” storage is outside the registered privacy claim

**Exact quote / location:** `/privacy`: **“Presence Bridge stores your roster,
status, imported calendar events, settings, and license token on your device.”**

The `privacy-local` claim names roster, status, imported calendar data, and the
license token, but not settings. Its test changes status and calendar data and
clears roster/license storage; it does not save a setting or the shared-folder
grant and prove that those values remain local and are cleared.

**Why this matters:** “Settings” is a broader privacy promise than the claim
entry and test. A visitor cannot tell which settings are meant or verify that
none leave the device.

**Concrete fix:** Either rewrite the sentence to the exact tested fields, or
expand `privacy-local` to include settings. The tagged test should change the
user name and shared-folder grant, record requests, clear site storage, reload,
and assert those keys are absent.

### F-4-3 — MINOR — “No advertising trackers” is an unlisted claim

**Exact quotes / locations:**

- `/privacy`: **“We do not use analytics or advertising trackers.”**
- README: **“It has no analytics or advertising trackers.”**

`transparent-presence` names and tests the absence of an analytics request; it
does not list advertising trackers. `no-payment-runtime` inspects dependencies,
but only for payment providers.

**Why this matters:** A privacy-sensitive visitor can rely on both halves of
the sentence. The current registry presents broader public copy than its claim
and test describe.

**Concrete fix:** Expand `transparent-presence` to say **“No analytics or
advertising tracker runs”**. Its tagged test should record requests across all
public routes and inspect the production dependency/import surface for tracker
code. Alternatively, remove “or advertising trackers” from both surfaces.

### F-4-4 — MINOR — “The product” is a decorative label that names nothing

**Exact quote / location:** Landing page, above **“Check a teammate and open a
contact tool”**: **“The product.”**

**Why this matters:** The label would fit any product page and gives a scanning
visitor no information. The following heading already names the section.

**Concrete fix:** Delete **“The product.”** No replacement is needed.

### F-4-5 — MINOR — “Clear” is a subjective adjective in the core description

**Exact quotes / locations:**

- Landing: **“Read a clear status note before opening Slack, Teams, Meet,
  email, Zoom, or a phone link.”**
- README: **“Each person has a clear status, note, and saved contact tool.”**

**Why this matters:** “Clear” is not an observable field or result. It spends a
word praising the interface instead of naming what the visitor reads.

**Concrete rewrites:**

- **“Read a teammate's status note before opening Slack, Teams, Meet, email,
  Zoom, or a phone link.”**
- **“Each person has a status, note, and saved contact tool.”**

## Demo and sandbox verification

- One click from `/` opened `/?demo=1` with the persistent **“Demo — sample
  data, nothing is saved”** banner, **Reset demo**, and **Start for real**.
- At 390 × 844, Ava, Leo, and Noor ended at 569, 667, and 765 CSS pixels. The
  first screen therefore already showed the product in use with realistic data.
- The sample contained four named teammates, distinct statuses and notes, and
  Slack, Teams, Meet, and email contact tools.
- Changing the visitor's status wrote only
  `sessionStorage["demo:presence-bridge:v1"]`. The real
  `localStorage["presence-bridge:v1"]` remained absent.
- **Reset demo** restored `available` and removed the demo key. **Start for
  real** removed the demo key and opened an empty real roster. Browser Back
  recreated the original sample with `available` selected.
- The complete observed landing/demo/edit/reset/exit flow requested only
  `https://presence-bridge.sociobot.in` and logged no console error.
- A separate fresh context registered the service worker, reloaded once,
  switched offline, and reloaded `/demo` with HTTP 200 and Ava still visible.

The demo and sandbox gates pass.

## Declared claim results

I cloned the reviewed commit into
`/tmp/presence-review4-claims-HyZDjT/clone`, ran `npm ci`, and ran every exact
`test` command from `.factory/claims.json` separately. Each command ran the 15
unit assertions and its tagged browser case in both configured projects.

| Claim | Exact command result |
| --- | --- |
| `contact-handoff` | PASS |
| `privacy-local` | PASS |
| `transparent-presence` | PASS |
| `no-message-transport` | PASS |
| `calendar-local` | PASS |
| `offline-reload` | PASS |
| `free-limit` | PASS |
| `demo-isolation` | PASS |
| `demo-exit-discard` | PASS |
| `demo-seed-and-first-view` | PASS |
| `paid-roster` | PASS |
| `checkout-availability` | PASS |
| `license-minimization` | PASS |
| `license-restore` | PASS |
| `status-note` | PASS |
| `json-backup` | PASS |
| `shared-presence` | PASS |
| `shared-folder-refresh` | PASS |
| `release-platforms` | PASS |
| `signing-configuration` | PASS |
| `no-payment-runtime` | PASS |
| `platform-download` | PASS |
| `release-checksums` | PASS |
| `release-fallback` | PASS |
| `linux-installer` | PASS |
| `windows-installer` | PASS |

Declared-command result: **26/26 PASS, 0 untested declared commands.** Findings
F-4-2 and F-4-3 are public statements outside the exact registered scope.
F-4-1 records the separate, reproducible failure of the required full gate.

## Earlier finding verification

I checked every earlier finding against both the live site and current code.
No earlier ID is reissued.

| Earlier finding | Live and code result |
| --- | --- |
| F-1-1 — demo state survived exit | **FIXED.** Live Reset, Start for real, Back, and a new context restore the seed. `src/app-core.ts` removes `DEMO_STORE` on exit/reset, and both demo claims pass. |
| F-1-2 — unproved `$24` price | **FIXED.** `$24` is absent from live copy and repository product copy. Purchase surfaces state that checkout is unavailable, and the claim passes. |
| F-1-3 — mobile Privacy hidden | **FIXED.** Privacy is visible in the 390-pixel header with its tested 44-pixel target. No CSS hides the third link. |
| F-1-4 — third mobile fact below fold | **FIXED.** All three facts are visible in the untouched 390 × 844 live viewport; the mobile assertion passes. |
| F-1-5 — incomplete `/app.html` | **FIXED.** Live and source contain the route title, description, canonical, social tags, icons, manifest, Home/Privacy/Terms navigation, footer, and sitemap entry. |
| F-1-6 — stale route metadata / incomplete 404 | **FIXED.** Every live route updates metadata; navigation and Back focus the h1. The styled unknown path returns HTTP 404 with complete metadata and a home action. |
| F-1-7 — mood headings and inconsistent contact-tool terms | **FIXED for the quoted defects.** The old headings and competing terms are absent; `contact tool` is consistent. F-4-4 and F-4-5 are different copy issues. |
| F-1-8 — 25-word README privacy sentence | **FIXED.** It remains split into 10-word and 13-word sentences. |
| F-2-1 — mobile demo hid sample rows / count conflict | **FIXED.** Copy says four teammates plus the visitor, three live rows fit in the first viewport, and the first-view claim passes. |
| F-2-2 — release, signing, demo-disposal, and payment claims were missing | **FIXED for every quoted claim.** The exact added entries remain and their commands pass. F-4-2 and F-4-3 concern different privacy wording. |
| F-2-3 — copy audit was incomplete and miscounted | **FIXED.** The generator, committed audit, and drift test agree and include titles, descriptions, labels, actions, alt text, and README prose. |
| F-2-4 — Settings and Slack buttons lacked result verbs | **FIXED.** Live controls visibly say **Open settings** and **Open Slack**; code generates `Open {tool}`. |
| F-2-5 — every status refresh required manual import | **FIXED.** The desktop code watches a chosen folder, imports bounded presence files, marks stale updates, and removes the grant on Stop watching. Its claim passes. |
| F-3-1 — license restoration was unlisted | **FIXED.** `license-restore` names the outcome and its test verifies the fixture token, reload, and paid limits. |
| F-3-2 — status notes were unlisted | **FIXED.** `status-note` verifies real persistence, demo isolation, and Reset. |
| F-3-3 — privacy deletion omitted license state | **FIXED.** `privacy-local` names the license token and asserts token, verdict, and roster removal after clearing storage. |
| F-3-4 — unlisted merchant-of-record statement | **FIXED.** The statement is absent from the live product and repository copy. |
| F-3-5 — README used “sandbox” for “demo” | **FIXED.** The heading is **Try the demo**. |
| F-3-6 — README used “installed site” | **FIXED.** It now says **“After its first online visit, the browser app works offline.”** |
| F-3-7 — sharing boundary used infrastructure jargon | **FIXED.** The README now names activity tracking, messages, contacts, and online roster storage directly. |
| F-3-8 — sharing used “publishing/watcher” jargon | **FIXED.** The README consistently says watch a folder, import updates, and download a presence update. |

## Structure, links, accessibility, and identity

- `/`, `/demo`, `/privacy`, `/terms`, `/download`, and `/app.html` returned
  200. A fresh unknown path returned the designed 404 with HTTP 404.
- Every real route had `lang="en"`, one h1, a main landmark, a route-specific
  title, description, canonical, Open Graph/Twitter metadata, favicon, and
  apple-touch icon. The title pattern is correct for each route.
- The header and footer remain present across site routes; `/app.html` has its
  compact app navigation and legal footer. Privacy and Terms are reachable.
- Client navigation and Browser Back restored the URL, title, and h1 focus.
  Direct deep links and reloads retained the correct route.
- All discovered internal routes and assets returned their expected status.
  The Param Factory site, GitHub release page, AppImage, `SHA256SUMS`, and
  `latest.json` returned 200 after redirects. The only non-HTTP links were the
  intentional privacy/support `mailto:` links.
- `robots.txt` and `sitemap.xml` returned 200; the sitemap lists every public
  route, including `/app.html`.
- The factory URL verifier passed all six real routes with one h1, `lang=en`, a
  main landmark, complete image alternatives, named controls, and no console
  or page errors. Integrated Axe, keyboard navigation, dialog focus, 44-pixel
  targets, and 200% text checks passed before the later runner crash.
- The response carries CSP, `frame-ancestors 'none'`, HSTS,
  `X-Content-Type-Options`, strict referrer policy, and a permissions policy.
- The visual identity is distinct: original blue-hour studio art, warm-window
  status lights, clipped architectural panels, brass bridge lines,
  Georgia/system type, and one-shot motion match `.factory/design.md`.
  Reduced-motion CSS removes the animation. It is not a generic SaaS template.

## Missed leverage

No missing AI step is justified. The brief requires chosen presence rather
than inferred activity, so a model-generated status would weaken the product's
consent boundary. The useful adjacent capabilities are already present:
calendar import, JSON backup, explicit presence-update export/import, a
one-click sample project, and opt-in shared-folder refresh. No provider key,
decorative AI action, or Azure endpoint appears in the product.

## Copy audit

Counts use the repository's whitespace-counting generator. This inventory
includes titles, descriptions, visible sentences, headings, actions, labels,
placeholders, accessible names, and alt text so every landing/README string is
accounted for. No entry exceeds 22 words and no banned term appears. Findings
are marked in the final column.

### Rendered landing page

| Copy | Words | Flag |
| --- | ---: | --- |
| Presence Bridge — See who is free before you message | 10 | — |
| See your small team's chosen status, then open the contact tool you already use. | 14 | — |
| No new inbox. | 3 | — |
| A local desktop roster | 4 | — |
| See who is free before you message | 7 | — |
| For small teams that need availability without moving every conversation into another chat app. | 14 | — |
| Try it with sample data | 5 | — |
| See four sample teammates and your status in one click. | 10 | — |
| Your roster stays on this device unless you share an update. | 11 | — |
| Works after the first visit, even offline. | 7 | — |
| Free for up to five people. | 6 | — |
| The product | 2 | F-4-4 |
| Check a teammate and open a contact tool | 8 | — |
| Read a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link. | 16 | F-4-5 |
| Reset demo | 2 | — |
| Start for real | 3 | — |
| ⌁ Presence Bridge | 3 | — |
| Open settings | 2 | — |
| Who is free? | 3 | — |
| Your presence | 2 | — |
| available · Free for a quick question | 7 | — |
| Status availablebusyawayoffline | 2 | — |
| Find a teammate | 3 | — |
| Name, role, or status | 4 | — |
| Add person | 2 | — |
| 4 people | 2 | — |
| ↑↓ then Enter | 3 | — |
| AS Ava ShahDesign available | 4 | — |
| LM Leo MartinEngineering busy | 4 | — |
| NO Noor OkaforOperations away | 4 | — |
| MP Mina ParkAccounts offline | 4 | — |
| Design | 1 | — |
| Ava Shah | 2 | — |
| available | 1 | — |
| Reviewing the launch screens | 4 | — |
| Set manually | 2 | — |
| Open a contact tool | 4 | — |
| Open Slack↗ | 2 | — |
| Edit person | 2 | — |
| Remove from roster | 3 | — |
| How it works | 3 | — |
| How to use the roster | 5 | — |
| 01Set your statusChoose available, busy, away, or offline. | 8 | — |
| Add a short note. | 4 | — |
| Set your status | 3 | — |
| Choose available, busy, away, or offline. | 6 | — |
| 02Check the rosterSee each teammate's status before you interrupt their work. | 11 | — |
| Check the roster | 3 | — |
| See each teammate's status before you interrupt their work. | 9 | — |
| 03Open a contact toolStart the conversation in the app your team already chose. | 13 | — |
| Start the conversation in the app your team already chose. | 10 | — |
| Privacy and sharing | 3 | — |
| Share status, not surveillance | 4 | — |
| Download a presence update when you want teammates to see it. | 11 | — |
| It carries only your chosen status fields. | 7 | — |
| Presence Bridge does not carry messages or infer activity. | 9 | — |
| Bridge Plus is not available in this release | 8 | — |
| Bridge Plus limits and contact tools | 6 | — |
| Bridge Plus supports up to ten people and two contact tools per person. | 13 | — |
| The free local roster holds five. | 6 | — |
| Bridge Plus purchases are not available right now. | 8 | — |
| The free five-person roster is ready now. | 7 | — |
| Already have a license? | 4 | — |
| Restore it in the desktop app Settings. | 7 | — |
| Presence BridgeSee who is free, then open a contact tool. | 10 | — |
| Privacy | 1 | — |
| Terms | 1 | — |
| Built by Param Factory | 4 | — |
| v0.1.21 · Original generated artwork | 5 | — |
| A small studio with five warm windows beside a bridge at blue hour. | 13 | — |
| Presence settings with manual status and local calendar import. | 9 | — |
| The sample roster showing Leo as busy from his calendar. | 10 | — |
| A selected teammate with Slack and email contact tool buttons. | 10 | — |
| Presence Bridge home | 3 | — |
| Team roster | 2 | — |
| Selected teammate | 2 | — |

### README

| Copy | Words | Flag |
| --- | ---: | --- |
| Presence Bridge | 2 | — |
| See who is free, then open the contact tool you already use. | 12 | — |
| Presence Bridge is a local desktop roster for teams of two to ten people. | 14 | — |
| Each person has a clear status, note, and saved contact tool. | 11 | F-4-5 |
| The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. | 15 | — |
| When a teammate shares a small presence update file, you can import it into your local roster. | 17 | — |
| The roster and imported .ics calendar events stay on this device. | 11 | — |
| A presence update leaves only when its owner downloads it. | 10 | — |
| It contains chosen status fields, not calendar events, contact tools, activity, or messages. | 13 | — |
| After its first online visit, the browser app works offline. | 10 | — |
| These statements and each other product claim map to browser tests in .factory/claims.json. | 13 | F-4-2, F-4-3 |
| Try the demo | 3 | — |
| Run the site and open http://localhost:4173/?demo=1, or use the hosted path: | 11 | — |
| The demo starts with four teammates and your status. | 9 | — |
| It uses the separate demo:presence-bridge:v1 session key. | 7 | — |
| Resetting, leaving, or closing the demo discards its changes. | 9 | — |
| None of these actions changes the real roster. | 8 | — |
| Share a chosen status | 4 | — |
| Open Settings, choose Download presence update, then send that file using a shared folder or a contact tool. | 18 | — |
| A teammate imports it from the same Settings panel. | 9 | — |
| Updates never send automatically, and an imported status remains a local roster row. | 13 | — |
| Presence Bridge does not track activity, carry messages, copy contacts, or store your team roster online. | 16 | — |
| The installed desktop app can watch a shared folder you choose. | 11 | — |
| It imports newer .presence.json files and marks updates older than one day as stale. | 14 | — |
| Choose Stop watching to remove the saved folder grant. | 9 | — |
| Watching a folder only imports teammate updates. | 7 | — |
| To share your own status, download a new presence update. | 10 | — |
| Run and test | 3 | — |
| Requirements: Node.js 22, npm, Rust stable, and the Tauri 2 system packages. | 12 | — |
| npm run build:site is the static deploy command. | 8 | — |
| It writes index.html and all public assets to dist/site/. | 9 | — |
| Run the desktop shell during development: | 6 | — |
| Build the current platform package: | 5 | — |
| Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. | 12 | — |
| Tagging v creates the platform packages, SHA256SUMS, and latest.json. | 9 | — |
| The download page chooses your platform package. | 7 | — |
| It links to the release page if release information is unavailable. | 11 | — |
| For a terminal install, use the script for your platform. | 10 | — |
| The Linux script verifies SHA256SUMS before installing the AppImage. | 9 | — |
| The Windows release job verifies the setup checksum before it launches the installer. | 13 | — |
| Product limits and Bridge Plus | 5 | — |
| The free local roster holds five people with one contact tool each. | 12 | — |
| Bridge Plus supports ten people and two contact tools per person. | 11 | — |
| Bridge Plus is not available for purchase in this release. | 10 | — |
| The app shows no checkout link and keeps the free roster usable. | 12 | — |
| Existing licenses can be restored in Settings. | 7 | — |
| No payment provider runs inside the app. | 7 | — |
| Presence Bridge does not transport messages or infer activity. | 9 | — |
| Keyboard and pointer activity never change presence. | 7 | — |
| It has no analytics or advertising trackers. | 7 | F-4-3 |
| Project map | 2 | — |
| src/app-core.ts: roster, calendar import, contact tools, backup, and license state | 10 | — |
| src-tauri/src/lib.rs: tray behavior, native contact handoff checks, and shared-folder access | 10 | — |
| src/site.ts: landing pages, demo route, download detection, privacy, terms, and 404 | 11 | — |
| src-tauri/: Tauri tray shell and packaging configuration | 7 | — |
| .github/workflows/release.yml: cross-platform release builds | 4 | — |
| .factory/design.md: visual system and image provenance | 6 | — |
| .factory/demo.md: sandbox contract | 3 | — |
| .factory/claims.json: product claims and their tests | 6 | — |
| Deploy | 1 | — |
| Publish dist/site/ at https://presence-bridge.sociobot.in. | 4 | — |
| The included staticwebapp.config.json maps the known app routes, serves a real 404, and supplies security headers. | 16 | — |
| Infrastructure, DNS, product registration, and signing stay outside this repository. | 10 | — |
| License | 1 | — |
| MIT. | 1 | — |
| See LICENSE. | 2 | — |

Terminology remains consistent: **roster**, **status**, **contact tool**,
**calendar**, **Bridge Plus**, **demo**, **presence update**, and **shared
folder** each name one concept.

## What would make this perfect

Make the exact `npm test` gate pass reliably from a clean clone, bring the two
privacy statements into the claims registry and their observable tests, remove
the decorative **“The product”** label, and apply the two concrete “clear”
rewrites. Then rerun all 26 exact claim commands, the full gate repeatedly, and
the complete cold live checklist. Nothing else is currently left to add.
