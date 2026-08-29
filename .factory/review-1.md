# Adversarial first-read review 1 — Presence Bridge

**Reviewed:** 2026-08-29  
**Live target:** `https://presence-bridge.sociobot.in`  
**Verdict:** **FAIL**

The product is understandable and tryable on a cold visit, and all 18 declared
claim commands pass. It still has the findings below. A PASS requires zero
findings.

## Cold first read

At both 390 × 844 and 1440 × 900, before scrolling:

- **What it does:** It shows a small team's chosen availability, then opens an
  existing contact tool.
- **For whom:** Small teams that do not want another chat app.
- **First action:** Click **Try it with sample data** to see a five-person
  roster.

This first-read gate passes. The mobile screenshot also showed no horizontal
overflow, no browser-console errors, and same-origin requests only during the
landing/demo flow.

## Findings

### F-1-1 — BLOCKING — Leaving demo does not discard demo state

**Location / exact evidence:** `/demo`, **Start for real**. In a fresh 390px
context, I changed **Your presence** to `away`, pressed **Start for real**, and
observed `sessionStorage["demo:presence-bridge:v1"]` still contain the changed
state. The real `localStorage["presence-bridge:v1"]` was correctly `null`.
Pressing Back restored the demo with `away` selected.

**Why this fails:** The required sandbox contract says that leaving demo mode
discards demo data unless the visitor explicitly chooses to keep it. The banner
says “sample data, nothing is saved”; retaining edited sample state through the
transition conflicts with that expectation, even though it does not touch real
storage.

**Concrete fix:** Make **Start for real** remove
`demo:presence-bridge:v1` immediately before navigating to `/app.html`, or
replace it with an explicit choice: **Discard demo and start for real** and
**Keep demo open**. Add a `@claim:demo-exit-discard` test that changes a demo
status, follows the real-start path, returns to `/demo`, and asserts the seed
state is restored.

### F-1-2 — BLOCKING — The $24 price is a public claim with no claim entry or outcome test

**Location / exact quotes:**

- Landing price strip: “**Bridge Plus · $24 once when available**”
- `/terms`: “**When checkout is available, it costs $24 once.**”
- README, Product limits: “**When its Sociobot checkout is available, it costs
  $24 once.**”

`claims.json` contains no price/checkout-success claim. `paid-roster` proves
the licensed limit and second route; `checkout-availability` proves that no
purchase link is shown while checkout is unavailable. Neither proves the
advertised price when sales resume.

**Why this fails:** A price is a reliance claim. A visitor cannot verify this
release's stated future price from the sandbox, and the previous checkout
failure makes this especially material.

**Concrete fix:** Until checkout is available, remove `$24` and use “Bridge
Plus is not available in this release.” When it is available, add a
`one-time-price` claim with a recorded Sociobot checkout response that asserts
the displayed $24 amount and a usable redirect, then restore the price copy.

### F-1-3 — MINOR — Mobile navigation hides Privacy

**Location / exact evidence:** At 390px, the live landing header contains only
**Demo** and **Download**. `src/styles.css` explicitly applies
`.site-header nav a:nth-child(3) { display: none; }`; the third item is
**Privacy**.

**Why this fails:** The required header pattern includes Privacy on every
route. The footer is far below the fold, so the privacy information promised in
the first-screen facts is not directly reachable from the mobile header.

**Concrete fix:** Keep Privacy visible at 390px (a compact three-link row, a
menu button with accessible disclosure, or make the visible second action
Privacy and move Download to the page body). Do not remove it with CSS.

### F-1-4 — MINOR — The first mobile screen omits the third required plain fact

**Location / exact evidence:** On the 390 × 844 cold screenshot, the first
viewport ends after “**Works after the first visit, even offline.**” The third
hero fact, “**Free for up to five people.**”, begins below the fold.

**Why this fails:** The required first-screen shape includes all three plain
facts (privacy, offline, price). This prevents a phone visitor from seeing the
free limit without scrolling.

**Concrete fix:** Reduce mobile hero vertical padding/type scale or move the
three facts above the action so all three are visible at 390 × 844 without a
scroll.

### F-1-5 — MINOR — `/app.html` is a public route without the required route skeleton or metadata

**Location / exact evidence:** `/app.html` is the target of **Start for real**.
It has title `Roster — Presence Bridge`, one description, but no canonical,
Open Graph, Twitter, apple-touch icon, manifest, site header navigation,
Privacy link, Terms link, or footer. Its visible wordmark points to `#`, not
home. The sitemap omits `/app.html`.

**Why this fails:** It is a directly linked real place, yet it loses the
required route title pattern, legal navigation, canonical/OG metadata, and
sitemap coverage. A visitor who starts for real has no obvious way back or way
to read Privacy/Terms.

**Concrete fix:** Set the title to `Presence Bridge — Your local team roster`,
add canonical, OG/Twitter, apple-touch and manifest tags, and include
`/app.html` in the sitemap. Make the wordmark link to `/` and provide compact
Privacy/Terms/Home links in the app shell (or serve the app through the same
site header/footer).

### F-1-6 — MINOR — SPA routes retain landing metadata; the 404 has no OG metadata

**Location / exact evidence:** After live client-side navigation to `/demo`,
`/privacy`, `/terms`, and `/download`, the title and canonical update, but the
description remains “**See your small team's availability, then open the chat
or call tool you already use. No new inbox.**” and the Open Graph title remains
the landing title. The real 404 has no `og:title` at all.

**Why this fails:** Route metadata should describe the place being shared or
indexed. Landing privacy copy is misleading metadata for the Privacy page;
the 404 also fails the required OG field.

**Concrete fix:** Give every route a metadata record (title, ≤155-word plain
description, canonical, OG/Twitter title and description) and update all of
them in `navigate()`. Add matching metadata to `404.html`.

### F-1-7 — MINOR — Copy uses mood headings, jargon, and inconsistent names for the same action

**Location / exact quotes:**

- Landing headings: “**One glance, then one handoff**”, “**Keep the routine
  small**”, “**Set your light**”, “**A quiet boundary**”, and “**More room,
  same quiet roster**”.
- Landing lead: “**another chat suite**”.
- README: “**The download page selects the matching package from GitHub
  Release metadata and has a calm fallback when no release exists.**”
- One saved destination is called a “**saved contact link**” (README),
  “**contact tool**” (demo), “**tool**” (sharing instructions), “**contact
  route**” (pricing), and “**handoff**” (landing and code).

**Why this fails:** The headings do not name their sections when heard alone;
“light”, “handoff”, “suite”, and “metadata” require product or technical
context. Multiple names for one contact destination make the first-use flow
harder to scan.

**Concrete fix:** Use section names and one term throughout:

- “Check a teammate and open a contact tool”
- “How to use the roster”
- “Set your status”
- “Privacy and sharing”
- “Bridge Plus limits and contact tools”
- “another chat app”
- “The download page chooses your platform package and links to the release
  page if release information is unavailable.”

Choose either **contact tool** or **contact link** and replace the other four
labels globally.

### F-1-8 — MINOR — README has an overlong sentence that combines two privacy facts

**Location / exact quote (25 words):** “**A presence update only leaves when
its owner explicitly downloads it, and contains only the chosen status
fields—not calendar events, contact routes, activity, or messages.**”

**Why this fails:** It exceeds the 22-word hard cap and combines the action
that sends a file with the file's contents.

**Concrete fix:** “A presence update leaves only when its owner downloads it.
It contains chosen status fields, not calendar events, contact routes,
activity, or messages.”

## Demo, privacy, claims, and history checks

- **One-click demo:** PASS for entry, realistic four-person sample, immediate
  product view, persistent banner, Reset, and real-storage isolation. F-1-1
  remains the required demo-exit failure.
- **Privacy/offline:** PASS in fresh browser contexts. Demo requests were
  same-origin only; no analytics, third-party font, or model-provider request
  appeared. Offline reload worked after the first visit.
- **Claims:** PASS. I ran every exact `claims.json` command after `npm ci`;
  all 18 passed in both Chromium and 390px projects. F-1-2 is an unlisted
  public price claim, not a failing declared test.
- **Earlier verification findings:** CONFIRMED FIXED in live/code, not merely
  marked fixed: broken paid link is absent; Linux/Windows installer checksum
  tests pass; two isolated rosters exchange an explicitly downloaded chosen
  status; malformed/free-limit imports are rejected; calendar status refreshes;
  390px layout/touch targets and dialog focus pass; the service worker is
  versioned; missing routes return styled HTTP 404s. The historical checkout
  price defect is not repeated as a dead link, but its new untested $24 claim
  is recorded as F-1-2.
- **Structure/crawl:** PASS for live `/`, `/demo`, `/privacy`, `/terms`,
  `/download`, external factory/release links, CSP, favicon, robots, and
  sitemap entries that exist. The metadata/sitemap/app-route gaps are F-1-5
  and F-1-6. The 404 correctly returns HTTP 404; its expected browser failed-
  document message was not counted as a product console error.
- **Missed leverage / AI:** No missing AI feature found. The brief is served by
  explicit local status, import/export, and existing-tool handoff; a model
  would add no necessary step. JSON backup and explicit status-file exchange
  are present.

## Copy audit

All landing copy, including the live preview and footer, is listed below.
Counts use whitespace-separated words. `†` marks text covered by F-1-7;
`‡` marks F-1-2. No landing sentence exceeds 22 words.

| Landing copy | Words |
| --- | ---: |
| A local desktop roster | 4 |
| See who is free before you message | 8 |
| For small teams that need availability without moving every conversation into another chat suite. † | 14 |
| Try it with sample data | 5 |
| See a five-person roster in one click. | 7 |
| Your roster stays on this device unless you share an update. | 11 |
| Works after the first visit, even offline. | 7 |
| Free for up to five people. | 6 |
| The product | 2 |
| One glance, then one handoff † | 5 |
| Check a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link. | 16 |
| How it works | 3 |
| Keep the routine small † | 4 |
| Set your light † | 3 |
| Choose available, busy, away, or offline. | 6 |
| Add a short note. | 4 |
| Check the roster | 3 |
| See each teammate's status before you interrupt their work. | 9 |
| Open the right tool | 4 |
| Start the conversation in the app your team already chose. | 10 |
| A quiet boundary † | 3 |
| Share status, not surveillance | 4 |
| Download a presence update when you want teammates to see it. | 11 |
| It carries only your chosen status fields. | 7 |
| Presence Bridge does not carry messages or infer activity. | 9 |
| Bridge Plus · $24 once when available ‡ | 7 |
| More room, same quiet roster † | 5 |
| Add up to ten people and more contact routes. † | 9 |
| The free local roster holds five. | 6 |
| Bridge Plus purchases are not available right now. | 8 |
| The free five-person roster is ready now. | 8 |
| Already have a license? Restore it in the desktop app Settings. | 11 |
| Demo — sample data, nothing is saved | 6 |
| Reset demo | 2 |
| Start for real | 3 |
| Who is free? | 3 |
| Your presence | 2 |
| Free for a quick question | 5 |
| Find a teammate | 3 |
| Name, role, or status | 4 |
| Add person | 2 |
| Four people | 2 |
| Reviewing the launch screens | 4 |
| Set manually | 2 |
| Open their tool † | 3 |
| Edit person | 2 |
| Remove from roster | 3 |
| See who is free, then open your existing tool. † | 9 |
| Original generated artwork | 3 |

README sentence audit (headings, commands, code blocks, and file-map fragments
are labels/instructions rather than sentences and are omitted). `†`/`‡` have
the same meanings as above; `*` exceeds 22 words.

| README sentence | Words |
| --- | ---: |
| See who is free, then open the chat tool you already use. | 12 |
| Presence Bridge is a local desktop roster for teams of two to ten people. | 13 |
| Each person has a clear status, note, and saved contact link. † | 11 |
| The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. | 15 |
| When a teammate chooses to share a small presence update file, you can import it into your local roster. | 19 |
| The roster and imported `.ics` calendar events stay on this device. | 11 |
| A presence update only leaves when its owner explicitly downloads it, and contains only the chosen status fields—not calendar events, contact routes, activity, or messages. * | 25 |
| The installed site works after the first visit, even offline. | 10 |
| These statements and each other product claim map to browser tests in `.factory/claims.json`. | 13 |
| Run the site and open `http://localhost:4173/demo`, or use the hosted path: | 11 |
| The demo starts with four colleagues and several contact tools. † | 10 |
| It uses the separate `demo:presence-bridge:v1` session key. | 6 |
| Resetting or closing it does not change the real roster. | 9 |
| Open **Settings**, choose **Download presence update**, then send that file using a shared folder or the tool your team already uses. † | 21 |
| A teammate imports it from the same Settings panel. | 9 |
| Updates never send automatically, and an imported status remains a local roster row. | 12 |
| This is the intentional sharing boundary: no activity tracking, message transport, contact scraping, or hosted roster relay. | 15 |
| `npm run build:site` is the static deploy command. | 8 |
| It writes `index.html` and all public assets to `dist/site/`. | 9 |
| Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. | 11 |
| Tagging `v*` creates the platform packages, `SHA256SUMS`, and `latest.json`. | 9 |
| The download page selects the matching package from GitHub Release metadata and has a calm fallback when no release exists. † | 20 |
| For a terminal install, use the script for your platform. | 10 |
| The Linux script verifies `SHA256SUMS` before installing the AppImage. | 9 |
| The Windows release job verifies the setup checksum before it launches the installer. | 12 |
| The free local roster holds five people with one contact route each. † | 11 |
| Bridge Plus raises the limit to ten and adds a second contact route. † | 12 |
| When its Sociobot checkout is available, it costs $24 once. ‡ | 10 |
| Purchases are not available in this release, so the app shows no checkout link and keeps the free roster usable. | 18 |
| Existing licenses can be restored in Settings. | 7 |
| No payment provider runs inside the app. | 7 |
| Presence Bridge does not transport messages or infer activity. | 9 |
| Keyboard and pointer activity never change presence. | 7 |
| It has no analytics or advertising trackers. | 7 |
| Publish `dist/site/` at `https://presence-bridge.sociobot.in`. | 4 |
| The included `staticwebapp.config.json` maps the known app routes, serves a real 404, and supplies security headers. | 14 |
| Infrastructure, DNS, product registration, and signing stay outside this repository. | 10 |
| MIT. | 1 |
| See [LICENSE](LICENSE). | 2 |

## What would make this perfect

Discard demo state on real-start, remove or prove the $24 price, retain a
visible mobile Privacy route, make `/app.html` and all SPA/404 metadata complete,
and apply the plain-language rewrites. Then rerun the full first-read checklist
from a fresh 390px and desktop context.
