import { describe, expect, it } from "vitest";
import { allowedDeepLink, applyCalendar, initialsFor, parseCalendar, sampleState } from "../../src/model";

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
});
