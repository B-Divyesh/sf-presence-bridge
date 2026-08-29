export type Presence = "available" | "busy" | "away" | "offline";

export type ContactTool = {
  id: string;
  label: string;
  url: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: Presence;
  note: string;
  until?: string;
  source: "manual" | "calendar";
  /** Stable publisher id when this row came from an opt-in presence update. */
  sharedFrom?: string;
  /** Timestamp supplied by the teammate's explicit presence update. */
  sharedUpdatedAt?: string;
  tools: ContactTool[];
};

export type CalendarEvent = { start: string; end: string; title: string };

export type RosterState = {
  me: TeamMember;
  members: TeamMember[];
  calendar: CalendarEvent[];
  calendarEnabled: boolean;
  /** Local id used only to recognise later updates from the same opted-in teammate. */
  shareId?: string;
};

export const FREE_ROSTER_LIMIT = 5;
export const PAID_ROSTER_LIMIT = 10;
export const FREE_CONTACT_ROUTE_LIMIT = 1;
export const PAID_CONTACT_ROUTE_LIMIT = 2;

const statuses: Presence[] = ["available", "busy", "away", "offline"];
const sources: TeamMember["source"][] = ["manual", "calendar"];

export type RosterImportLimits = {
  memberLimit: number;
  contactRouteLimit: number;
};

export type RosterImportError = "invalid" | "member-limit" | "contact-route-limit";

export type RosterImportResult =
  | { state: RosterState; error?: never }
  | { state?: never; error: RosterImportError };

export const sampleState = (): RosterState => ({
  me: {
    id: "me",
    name: "You",
    role: "Studio lead",
    initials: "YO",
    status: "available",
    note: "Free for a quick question",
    source: "manual",
    tools: [{ id: "email-me", label: "Email", url: "mailto:you@example.com" }]
  },
  members: [
    {
      id: "ava",
      name: "Ava Shah",
      role: "Design",
      initials: "AS",
      status: "available",
      note: "Reviewing the launch screens",
      source: "manual",
      tools: [{ id: "ava-slack", label: "Slack", url: "slack://user?team=T123&id=U100" }]
    },
    {
      id: "leo",
      name: "Leo Martin",
      role: "Engineering",
      initials: "LM",
      status: "busy",
      note: "Pairing until 3:30",
      until: "3:30 PM",
      source: "calendar",
      tools: [{ id: "leo-teams", label: "Teams", url: "msteams://teams.microsoft.com/l/chat/0/0?users=leo@example.com" }]
    },
    {
      id: "noor",
      name: "Noor Okafor",
      role: "Operations",
      initials: "NO",
      status: "away",
      note: "Back after the supplier visit",
      until: "4:00 PM",
      source: "manual",
      tools: [{ id: "noor-meet", label: "Meet", url: "https://meet.google.com/lookup/noor" }]
    },
    {
      id: "mina",
      name: "Mina Park",
      role: "Accounts",
      initials: "MP",
      status: "offline",
      note: "Back tomorrow",
      source: "manual",
      tools: [{ id: "mina-email", label: "Email", url: "mailto:mina@example.com" }]
    }
  ],
  calendar: [],
  calendarEnabled: false
});

export const emptyState = (): RosterState => ({
  me: {
    id: "me",
    name: "You",
    role: "",
    initials: "YO",
    status: "available",
    note: "",
    source: "manual",
    tools: []
  },
  members: [],
  calendar: [],
  calendarEnabled: false
});

export const allowedDeepLink = (value: string): boolean => {
  try {
    const url = new URL(value);
    return ["mailto:", "https:", "slack:", "msteams:", "zoommtg:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
};

export const initialsFor = (name: string): string =>
  name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? "").join("") || "?";

export const parseCalendar = (ics: string): CalendarEvent[] => {
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  return unfolded.split("BEGIN:VEVENT").slice(1).flatMap(block => {
    const rawStart = block.match(/DTSTART(?:;[^:]*)?:(.+)/)?.[1]?.trim();
    const rawEnd = block.match(/DTEND(?:;[^:]*)?:(.+)/)?.[1]?.trim();
    const title = block.match(/SUMMARY:(.+)/)?.[1]?.trim() || "Calendar event";
    if (!rawStart || !rawEnd) return [];
    const toIso = (raw: string) => {
      const match = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/);
      if (!match) return new Date(raw).toISOString();
      const [, y, m, d, h, min, sec, z] = match;
      return new Date(`${y}-${m}-${d}T${h}:${min}:${sec}${z || ""}`).toISOString();
    };
    try {
      const start = toIso(rawStart);
      const end = toIso(rawEnd);
      return Date.parse(start) < Date.parse(end) ? [{ start, end, title: title.slice(0, 120) }] : [];
    }
    catch { return []; }
  });
};

export const applyCalendar = (state: RosterState, now = new Date()): RosterState => {
  if (!state.calendarEnabled) return state;
  const active = state.calendar.find(event => new Date(event.start) <= now && now < new Date(event.end));
  if (!active) return { ...state, me: { ...state.me, status: "available", note: "Calendar is clear", until: undefined, source: "calendar" } };
  return {
    ...state,
    me: {
      ...state.me,
      status: "busy",
      note: active.title,
      until: new Date(active.end).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
      source: "calendar"
    }
  };
};

/** The next point at which a calendar-derived status can change. */
export const nextCalendarBoundary = (state: RosterState, now = new Date()): Date | undefined => {
  if (!state.calendarEnabled) return undefined;
  const nowTime = now.getTime();
  const boundary = state.calendar
    .flatMap(event => [new Date(event.start).getTime(), new Date(event.end).getTime()])
    .filter(time => Number.isFinite(time) && time > nowTime)
    .sort((left, right) => left - right)[0];
  return boundary === undefined ? undefined : new Date(boundary);
};

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function stringField(value: unknown, maxLength: number, required = false): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if ((required && !normalized) || normalized.length > maxLength) return undefined;
  return normalized;
}

function normalizeTool(value: unknown): ContactTool | undefined {
  const tool = record(value);
  if (!tool) return undefined;
  const id = stringField(tool.id, 100, true);
  const label = stringField(tool.label, 24, true);
  const url = stringField(tool.url, 2_000, true);
  if (!id || !label || !url || !allowedDeepLink(url)) return undefined;
  return { id, label, url };
}

function normalizeMember(value: unknown): TeamMember | undefined {
  const member = record(value);
  if (!member) return undefined;
  const id = stringField(member.id, 100, true);
  const name = stringField(member.name, 50, true);
  const role = stringField(member.role, 50);
  const note = stringField(member.note, 80);
  const status = member.status;
  const source = member.source;
  if (!id || !name || role === undefined || note === undefined || !statuses.includes(status as Presence) || !sources.includes(source as TeamMember["source"]) || !Array.isArray(member.tools)) return undefined;
  const tools = member.tools.map(normalizeTool);
  if (tools.some(tool => !tool)) return undefined;
  const until = member.until === undefined ? undefined : stringField(member.until, 100, true);
  const sharedFrom = member.sharedFrom === undefined ? undefined : stringField(member.sharedFrom, 100, true);
  const sharedUpdatedAt = member.sharedUpdatedAt === undefined ? undefined : stringField(member.sharedUpdatedAt, 100, true);
  if ((member.until !== undefined && !until) || (member.sharedFrom !== undefined && !sharedFrom) ||
    (member.sharedUpdatedAt !== undefined && (!sharedUpdatedAt || Number.isNaN(Date.parse(sharedUpdatedAt))))) return undefined;
  return {
    id,
    name,
    role,
    initials: initialsFor(name),
    status: status as Presence,
    note,
    ...(until ? { until } : {}),
    source: source as TeamMember["source"],
    ...(sharedFrom ? { sharedFrom } : {}),
    ...(sharedUpdatedAt ? { sharedUpdatedAt: new Date(sharedUpdatedAt).toISOString() } : {}),
    tools: tools as ContactTool[]
  };
}

function normalizeCalendar(value: unknown): CalendarEvent | undefined {
  const event = record(value);
  if (!event) return undefined;
  const start = stringField(event.start, 100, true);
  const end = stringField(event.end, 100, true);
  const title = stringField(event.title, 120, true);
  if (!start || !end || !title || !Number.isFinite(Date.parse(start)) || !Number.isFinite(Date.parse(end)) || Date.parse(start) >= Date.parse(end)) return undefined;
  return { start: new Date(start).toISOString(), end: new Date(end).toISOString(), title };
}

/**
 * Validate and normalize a backup before it becomes local state. This is kept
 * model-level so every storage and import path can apply the same policy.
 */
export const normalizeRosterBackup = (input: unknown, limits: RosterImportLimits): RosterImportResult => {
  const backup = record(input);
  if (!backup || !Array.isArray(backup.members) || !Array.isArray(backup.calendar) || typeof backup.calendarEnabled !== "boolean") return { error: "invalid" };
  const me = normalizeMember(backup.me);
  const members = backup.members.map(normalizeMember);
  const calendar = backup.calendar.map(normalizeCalendar);
  if (!me || members.some(member => !member) || calendar.some(event => !event)) return { error: "invalid" };
  const normalizedMembers = members as TeamMember[];
  const ids = [me.id, ...normalizedMembers.map(member => member.id)];
  if (new Set(ids).size !== ids.length || normalizedMembers.length > limits.memberLimit) return { error: normalizedMembers.length > limits.memberLimit ? "member-limit" : "invalid" };
  if ([me, ...normalizedMembers].some(member => member.tools.length > limits.contactRouteLimit)) return { error: "contact-route-limit" };
  const shareId = backup.shareId === undefined ? undefined : stringField(backup.shareId, 100, true);
  if (backup.shareId !== undefined && !shareId) return { error: "invalid" };
  return {
    state: {
      me,
      members: normalizedMembers,
      calendar: calendar as CalendarEvent[],
      calendarEnabled: backup.calendarEnabled,
      ...(shareId ? { shareId } : {})
    }
  };
};
