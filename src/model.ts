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
  tools: ContactTool[];
};

export type CalendarEvent = { start: string; end: string; title: string };

export type RosterState = {
  me: TeamMember;
  members: TeamMember[];
  calendar: CalendarEvent[];
  calendarEnabled: boolean;
};

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
      tools: [
        { id: "ava-slack", label: "Slack", url: "slack://user?team=T123&id=U100" },
        { id: "ava-email", label: "Email", url: "mailto:ava@example.com" }
      ]
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
      tools: [
        { id: "leo-teams", label: "Teams", url: "msteams://teams.microsoft.com/l/chat/0/0?users=leo@example.com" },
        { id: "leo-email", label: "Email", url: "mailto:leo@example.com" }
      ]
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
    try { return [{ start: toIso(rawStart), end: toIso(rawEnd), title }]; }
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
