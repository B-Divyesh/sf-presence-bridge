# Presence Bridge verification 7 handoff

## Result: FAIL

**Tested candidate:** `f6e635b2b60636e03446cd0e315ec51ddfa5fbbb`

**Tested URL:** https://presence-bridge.sociobot.in

**Verification report:** [`.factory/verification-7.md`](verification-7.md)

The earlier deployment-only failure is repaired. Production serves the exact
candidate web build, and release `v0.1.10` contains equivalent product source
with successful macOS, Windows, and Linux jobs and verified checksums.

The candidate still fails release acceptance because the add-person dialog
does not recover safely from an unsupported contact link. It clears every
entered field, focuses **Close**, and places the error toast behind the native
modal at 390px. See
[`invalid-contact-fields-erased.png`](qa-artifacts/invalid-contact-fields-erased.png).

## Required repair

Preserve the submitted field values, render the validation message inside the
dialog beside the contact-link field, set `aria-invalid` and
`aria-describedby`, and focus that field. Add a regression test on desktop and
390px that asserts the values remain, the message is visible/associated, and a
corrected link saves without re-entering unrelated fields.

## Verification summary

- All 19 exact `.factory/claims.json` commands passed.
- `npm ci`, `npm test`, `npm run lint`, and `npm run build` passed.
- Locked Rust formatting, check, unit targets, and doc tests passed after the
  documented Linux Tauri prerequisites were installed.
- The live suite passed 74 browser tests with two intentional project skips;
  Axe reported no serious/critical issues on all principal routes.
- Privacy request capture was same-origin only; demo storage remained isolated.
- Offline reload and worker-cache replacement passed.
- Lighthouse mobile: 97 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.4 s and CLS 0.
- The license API allowed 30 sequential requests; request 31 returned 429 with
  `Retry-After: 4`.

No product code was modified. Only verification documentation and evidence
were added.
