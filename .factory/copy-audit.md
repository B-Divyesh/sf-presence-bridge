# Copy audit

Generated from the rendered landing page and README with `scripts/copy-audit.mjs`. Words are whitespace-separated after Markdown and repeated spaces are removed. The browser test fails if this file differs from generated output.

Result: **PASS — no entry exceeds 22 words and no banned marketing term appears.**

## Rendered landing page

This includes visible headings, sentences, actions, labels, placeholders, image alt text, accessible names, the title, and the description.

| Copy | Words |
| --- | ---: |
| Presence Bridge — See who is free before you message | 10 |
| See your small team's chosen status, then open the contact tool you already use. | 14 |
| No new inbox. | 3 |
| A local desktop roster | 4 |
| See who is free before you message | 7 |
| For small teams that need availability without moving every conversation into another chat app. | 14 |
| Try it with sample data | 5 |
| See four sample teammates and your status in one click. | 10 |
| Your roster stays on this device unless you share an update. | 11 |
| Works after the first visit, even offline. | 7 |
| Free for up to five people. | 6 |
| The product | 2 |
| Check a teammate and open a contact tool | 8 |
| Read a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link. | 16 |
| Reset demo | 2 |
| Start for real | 3 |
| ⌁ Presence Bridge | 3 |
| Open settings | 2 |
| Who is free? | 3 |
| Your presence | 2 |
| available · Free for a quick question | 7 |
| Status availablebusyawayoffline | 2 |
| Find a teammate | 3 |
| Name, role, or status | 4 |
| Add person | 2 |
| 4 people | 2 |
| ↑↓ then Enter | 3 |
| AS Ava ShahDesign available | 4 |
| LM Leo MartinEngineering busy | 4 |
| NO Noor OkaforOperations away | 4 |
| MP Mina ParkAccounts offline | 4 |
| Design | 1 |
| Ava Shah | 2 |
| available | 1 |
| Reviewing the launch screens | 4 |
| Set manually | 2 |
| Open a contact tool | 4 |
| Open Slack↗ | 2 |
| Edit person | 2 |
| Remove from roster | 3 |
| How it works | 3 |
| How to use the roster | 5 |
| 01Set your statusChoose available, busy, away, or offline. | 8 |
| Add a short note. | 4 |
| Set your status | 3 |
| Choose available, busy, away, or offline. | 6 |
| 02Check the rosterSee each teammate's status before you interrupt their work. | 11 |
| Check the roster | 3 |
| See each teammate's status before you interrupt their work. | 9 |
| 03Open a contact toolStart the conversation in the app your team already chose. | 13 |
| Start the conversation in the app your team already chose. | 10 |
| Privacy and sharing | 3 |
| Share status, not surveillance | 4 |
| Download a presence update when you want teammates to see it. | 11 |
| It carries only your chosen status fields. | 7 |
| Presence Bridge does not carry messages or infer activity. | 9 |
| Bridge Plus is not available in this release | 8 |
| Bridge Plus limits and contact tools | 6 |
| Bridge Plus supports up to ten people and two contact tools per person. | 13 |
| The free local roster holds five. | 6 |
| Bridge Plus purchases are not available right now. | 8 |
| The free five-person roster is ready now. | 7 |
| Already have a license? | 4 |
| Restore it in the desktop app Settings. | 7 |
| Presence BridgeSee who is free, then open a contact tool. | 10 |
| Privacy | 1 |
| Terms | 1 |
| Built by Param Factory | 4 |
| v0.1.20 · Original generated artwork | 5 |
| A small studio with five warm windows beside a bridge at blue hour. | 13 |
| Presence settings with manual status and local calendar import. | 9 |
| The sample roster showing Leo as busy from his calendar. | 10 |
| A selected teammate with Slack and email contact tool buttons. | 10 |
| Presence Bridge home | 3 |
| Team roster | 2 |
| Selected teammate | 2 |

## README

This includes headings, prose, requirements, project-map entries, and license sentences. Fenced command examples are excluded.

| Copy | Words |
| --- | ---: |
| Presence Bridge | 2 |
| See who is free, then open the contact tool you already use. | 12 |
| Presence Bridge is a local desktop roster for teams of two to ten people. | 14 |
| Each person has a clear status, note, and saved contact tool. | 11 |
| The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. | 15 |
| When a teammate shares a small presence update file, you can import it into your local roster. | 17 |
| The roster and imported .ics calendar events stay on this device. | 11 |
| A presence update leaves only when its owner downloads it. | 10 |
| It contains chosen status fields, not calendar events, contact tools, activity, or messages. | 13 |
| After its first online visit, the browser app works offline. | 10 |
| These statements and each other product claim map to browser tests in .factory/claims.json. | 13 |
| Try the demo | 3 |
| Run the site and open http://localhost:4173/?demo=1, or use the hosted path: | 11 |
| The demo starts with four teammates and your status. | 9 |
| It uses the separate demo:presence-bridge:v1 session key. | 7 |
| Resetting, leaving, or closing the demo discards its changes. | 9 |
| None of these actions changes the real roster. | 8 |
| Share a chosen status | 4 |
| Open Settings, choose Download presence update, then send that file using a shared folder or a contact tool. | 18 |
| A teammate imports it from the same Settings panel. | 9 |
| Updates never send automatically, and an imported status remains a local roster row. | 13 |
| Presence Bridge does not track activity, carry messages, copy contacts, or store your team roster online. | 16 |
| The installed desktop app can watch a shared folder you choose. | 11 |
| It imports newer .presence.json files and marks updates older than one day as stale. | 14 |
| Choose Stop watching to remove the saved folder grant. | 9 |
| Watching a folder only imports teammate updates. | 7 |
| To share your own status, download a new presence update. | 10 |
| Run and test | 3 |
| Requirements: Node.js 22, npm, Rust stable, and the Tauri 2 system packages. | 12 |
| npm run build:site is the static deploy command. | 8 |
| It writes index.html and all public assets to dist/site/. | 9 |
| Run the desktop shell during development: | 6 |
| Build the current platform package: | 5 |
| Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. | 12 |
| Tagging v creates the platform packages, SHA256SUMS, and latest.json. | 9 |
| The download page chooses your platform package. | 7 |
| It links to the release page if release information is unavailable. | 11 |
| For a terminal install, use the script for your platform. | 10 |
| The Linux script verifies SHA256SUMS before installing the AppImage. | 9 |
| The Windows release job verifies the setup checksum before it launches the installer. | 13 |
| Product limits and Bridge Plus | 5 |
| The free local roster holds five people with one contact tool each. | 12 |
| Bridge Plus supports ten people and two contact tools per person. | 11 |
| Bridge Plus is not available for purchase in this release. | 10 |
| The app shows no checkout link and keeps the free roster usable. | 12 |
| Existing licenses can be restored in Settings. | 7 |
| No payment provider runs inside the app. | 7 |
| Presence Bridge does not transport messages or infer activity. | 9 |
| Keyboard and pointer activity never change presence. | 7 |
| It has no analytics or advertising trackers. | 7 |
| Project map | 2 |
| src/app-core.ts: roster, calendar import, contact tools, backup, and license state | 10 |
| src-tauri/src/lib.rs: tray behavior, native contact handoff checks, and shared-folder access | 10 |
| src/site.ts: landing pages, demo route, download detection, privacy, terms, and 404 | 11 |
| src-tauri/: Tauri tray shell and packaging configuration | 7 |
| .github/workflows/release.yml: cross-platform release builds | 4 |
| .factory/design.md: visual system and image provenance | 6 |
| .factory/demo.md: sandbox contract | 3 |
| .factory/claims.json: product claims and their tests | 6 |
| Deploy | 1 |
| Publish dist/site/ at https://presence-bridge.sociobot.in. | 4 |
| The included staticwebapp.config.json maps the known app routes, serves a real 404, and supplies security headers. | 16 |
| Infrastructure, DNS, product registration, and signing stay outside this repository. | 10 |
| License | 1 |
| MIT. | 1 |
| See LICENSE. | 2 |

## Terminology

| Concept | One term used |
| --- | --- |
| The list of people | roster |
| A person's availability | status |
| A saved communication destination | contact tool |
| Imported schedule file | calendar |
| Paid license | Bridge Plus |
| Isolated sample experience | demo |
| Explicitly shared availability file | presence update |
| Opt-in local refresh location | shared folder |
