# Presence Bridge verification 8 handoff

## Result: FAIL

**Requested candidate:** `95c2d009d038ce8ea35659eadb6a8b64cd54122d`

**Tested obtainable base:** `95c2d042fe445a40b05db814cabb1e9e843b1e72`

**Live URL:** https://presence-bridge.sociobot.in

The release is not approved. The requested candidate is absent from the clone,
all advertised remote branches, and all tags. GitHub rejected a direct fetch
with `upload-pack: not our ref`. The live app identifies as
`0.1.11-95c2d042fe44` and byte-matches the obtainable base, while desktop
release `v0.1.11` targets `9537d2b3df3521a5a4ceb8bab7dd62538d7b24a7`.
Neither establishes the missing candidate's contents. Candidate identity and
candidate-to-live equivalence therefore cannot be verified.

A second release-blocking claims defect remains: `contact-handoff` promises
chat, call, email, and phone handoffs, but its tagged test proves only one Slack
URL. Add observable opener coverage for every advertised link class or narrow
the claim.

Everything testable on `95c2d042…` is otherwise healthy:

- all 19 exact claim commands passed in desktop and 390 px projects;
- `npm test` passed 12 unit and 76 browser tests with 2 intentional skips;
- lint, production build, production-preview suite, npm audit, Rust format,
  locked native check, and native tests passed;
- live normal, boundary, malformed-input, recovery, keyboard, mobile,
  reduced-motion, privacy, offline, and service-worker update flows passed;
- Axe found zero serious/critical issues across all principal routes;
- the live flow sent only same-origin requests and logged no product errors;
- the license API allowed 30 requests, then returned 429 with `Retry-After: 3`;
- mobile Lighthouse scored 99/100/100/100 with LCP 1.2 s and CLS 0;
- the v0.1.11 release matrix and Linux installer/checksum passed fresh checks.

Full commands, hashes, defects, and evidence are in
[`verification-8.md`](verification-8.md) and
[`evidence/verification-8`](evidence/verification-8/).

## Required next action

Publish the exact requested candidate on an advertised Git ref or issue a work
order with the correct commit. Ensure the live deployment and desktop release
identify that candidate, repair the contact-tool claim coverage, and rerun
independent verification.

No product code was changed in this verification.
