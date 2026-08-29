import { describe, expect, it } from "vitest";
import {
  allowedDeepLink,
  applyCalendar,
  FREE_CONTACT_ROUTE_LIMIT,
  FREE_ROSTER_LIMIT,
  initialsFor,
  nextCalendarBoundary,
  normalizeRosterBackup,
  PAID_CONTACT_ROUTE_LIMIT,
  PAID_ROSTER_LIMIT,
  parseCalendar,
  sampleState
} from "../../src/model";
import { applyPresenceUpdate, createPresenceUpdate, parsePresenceUpdate } from "../../src/sharing";

describe("roster model", () => {
  it("accepts documented contact protocols", () => {
    expect(allowedDeepLink("mailto:ava@example.com")).toBe(true);
    expect(allowedDeepLink("slack://user?team=T1&id=U1")).toBe(true);
    expect(allowedDeepLink("javascript:alert(1)")).toBe(false);
  });

  it("creates readable initials", () => expect(initialsFor("Ava Shah")).toBe("AS"));

  it("uses an active local calendar event for presence", () => {
    const events = parseCalendar("BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:20260828T120000Z\nDTEND:20260828T130000Z\nSUMMARY:Client review\nEND:VEVENT\nEND:VCALENDAR");
    const state = sampleState(); state.calendar = events; state.calendarEnabled = true;
    const current = applyCalendar(state, new Date("2026-08-28T12:30:00Z"));
    expect(current.me.status).toBe("busy");
    expect(current.me.note).toBe("Client review");
  });

  it("finds the next calendar boundary so an open app can refresh presence", () => {
    const state = sampleState();
    state.calendarEnabled = true;
    state.calendar = [
      { start: "2026-08-28T12:00:00.000Z", end: "2026-08-28T12:30:00.000Z", title: "Current" },
      { start: "2026-08-28T13:00:00.000Z", end: "2026-08-28T14:00:00.000Z", title: "Later" }
    ];
    expect(nextCalendarBoundary(state, new Date("2026-08-28T12:15:00.000Z"))?.toISOString()).toBe("2026-08-28T12:30:00.000Z");
    expect(nextCalendarBoundary(state, new Date("2026-08-28T14:01:00.000Z"))).toBeUndefined();
  });

  it("rejects malformed backups and enforces roster and contact-route entitlements", () => {
    expect(normalizeRosterBackup({ me: {}, members: [{}] }, { memberLimit: FREE_ROSTER_LIMIT, contactRouteLimit: FREE_CONTACT_ROUTE_LIMIT })).toEqual({ error: "invalid" });

    const sixPeople = sampleState();
    sixPeople.members = Array.from({ length: 6 }, (_, index) => ({
      id: `member-${index}`,
      name: `Member ${index}`,
      role: "Team",
      initials: `M${index}`,
      status: "available" as const,
      note: "Ready",
      source: "manual" as const,
      tools: [{ id: `email-${index}`, label: "Email", url: `mailto:member-${index}@example.com` }]
    }));
    expect(normalizeRosterBackup(sixPeople, { memberLimit: FREE_ROSTER_LIMIT, contactRouteLimit: FREE_CONTACT_ROUTE_LIMIT })).toEqual({ error: "member-limit" });
    expect(normalizeRosterBackup(sixPeople, { memberLimit: PAID_ROSTER_LIMIT, contactRouteLimit: PAID_CONTACT_ROUTE_LIMIT }).state?.members).toHaveLength(6);

    const extraRoute = sampleState();
    extraRoute.members[0].tools.push({ id: "email", label: "Email", url: "mailto:ava@example.com" });
    expect(normalizeRosterBackup(extraRoute, { memberLimit: FREE_ROSTER_LIMIT, contactRouteLimit: FREE_CONTACT_ROUTE_LIMIT })).toEqual({ error: "contact-route-limit" });
  });

  it("shares only an opted-in status update and recognises later updates", () => {
    const publisher = sampleState(); publisher.shareId = "ava-device"; publisher.me.name = "Ava Shah"; publisher.me.status = "away"; publisher.me.note = "At the supplier";
    const update = createPresenceUpdate(publisher, new Date("2026-08-28T12:00:00Z"));
    expect(JSON.stringify(update)).not.toContain("calendar");
    expect(JSON.stringify(update)).not.toContain("tools");
    const receiver = applyPresenceUpdate(sampleState(), update);
    expect(receiver.members.find(member => member.sharedFrom === "ava-device")).toMatchObject({ name: "Ava Shah", status: "away" });
    update.person.status = "busy";
    const refreshed = applyPresenceUpdate(receiver, update);
    expect(refreshed.members.filter(member => member.sharedFrom === "ava-device")).toHaveLength(1);
    expect(refreshed.members.find(member => member.sharedFrom === "ava-device")?.status).toBe("busy");
    expect(parsePresenceUpdate('{"format":"wrong"}')).toBeNull();
  });
});
