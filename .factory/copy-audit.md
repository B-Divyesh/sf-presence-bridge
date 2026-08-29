# Copy audit

Count method: words separated by spaces. This audit covers every landing-page sentence, heading, action, and meaningful interface label. No item exceeds 22 words. No banned term appears.

## Landing page

| Copy | Words |
| --- | ---: |
| A local desktop roster | 4 |
| See who is free before you message | 8 |
| For small teams that need availability without moving every conversation into another chat app. | 14 |
| Try it with sample data | 5 |
| See a five-person roster in one click. | 7 |
| Your roster stays on this device unless you share an update. | 11 |
| Works after the first visit, even offline. | 7 |
| Free for up to five people. | 6 |
| The product | 2 |
| Check a teammate and open a contact tool | 8 |
| Read a clear status note before opening Slack, Teams, Meet, email, Zoom, or a phone link. | 16 |
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
| Open a contact tool | 4 |
| Edit person | 2 |
| Remove from roster | 3 |
| That contact tool link is not supported. | 7 |
| Use a mailto, https, Slack, Teams, Zoom, or phone link. | 10 |
| How it works | 3 |
| How to use the roster | 5 |
| Set your status | 3 |
| Choose available, busy, away, or offline. | 6 |
| Add a short note. | 4 |
| Check the roster | 3 |
| See each teammate's status before you interrupt their work. | 9 |
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
| The free five-person roster is ready now. | 8 |
| Already have a license? | 4 |
| Restore it in the desktop app Settings. | 7 |
| See who is free, then open a contact tool. | 9 |
| Original generated artwork | 3 |

## README prose

| Sentence | Words |
| --- | ---: |
| See who is free, then open the contact tool you already use. | 12 |
| Presence Bridge is a local desktop roster for teams of two to ten people. | 13 |
| Each person has a clear status, note, and saved contact tool. | 11 |
| The app opens Slack, Teams, Meet, Zoom, email, or phone links without creating another inbox. | 15 |
| When a teammate shares a small presence update file, you can import it into your local roster. | 17 |
| The roster and imported `.ics` calendar events stay on this device. | 11 |
| A presence update leaves only when its owner downloads it. | 10 |
| It contains chosen status fields, not calendar events, contact tools, activity, or messages. | 13 |
| The installed site works after the first visit, even offline. | 10 |
| These statements and each other product claim map to browser tests in `.factory/claims.json`. | 13 |
| Run the site and open `http://localhost:4173/?demo=1`, or use the hosted path. | 11 |
| The demo starts with four colleagues and several contact tools. | 10 |
| It uses the separate `demo:presence-bridge:v1` session key. | 6 |
| Resetting, leaving, or closing the demo discards its changes. | 9 |
| None of these actions changes the real roster. | 8 |
| Open Settings, choose Download presence update, then send that file using a shared folder or a contact tool. | 18 |
| A teammate imports it from the same Settings panel. | 9 |
| Updates never send automatically, and an imported status remains a local roster row. | 12 |
| This is the sharing boundary: no activity tracking, message transport, contact scraping, or hosted roster relay. | 15 |
| `npm run build:site` is the static deploy command. | 8 |
| It writes `index.html` and all public assets to `dist/site/`. | 9 |
| Desktop releases are built by GitHub Actions on macOS, Windows, and Linux. | 11 |
| Tagging `v*` creates the platform packages, `SHA256SUMS`, and `latest.json`. | 9 |
| The download page chooses your platform package. | 7 |
| It links to the release page if release information is unavailable. | 10 |
| For a terminal install, use the script for your platform. | 10 |
| The Linux script verifies `SHA256SUMS` before installing the AppImage. | 9 |
| The Windows release job verifies the setup checksum before it launches the installer. | 12 |
| The free local roster holds five people with one contact tool each. | 11 |
| Bridge Plus supports ten people and two contact tools per person. | 11 |
| Bridge Plus is not available for purchase in this release. | 10 |
| The app shows no checkout link and keeps the free roster usable. | 11 |
| Existing licenses can be restored in Settings. | 7 |
| No payment provider runs inside the app. | 7 |
| Presence Bridge does not transport messages or infer activity. | 9 |
| Keyboard and pointer activity never change presence. | 7 |
| It has no analytics or advertising trackers. | 7 |
| Publish `dist/site/` at `https://presence-bridge.sociobot.in`. | 4 |
| The included `staticwebapp.config.json` maps the known app routes, serves a real 404, and supplies security headers. | 14 |
| Infrastructure, DNS, product registration, and signing stay outside this repository. | 10 |

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
