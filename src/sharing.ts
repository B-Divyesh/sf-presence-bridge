import { initialsFor, type Presence, type RosterState, type TeamMember } from "./model";

export const PRESENCE_UPDATE_FORMAT = "presence-bridge-presence-v1";

export type PresenceUpdate = {
  format: typeof PRESENCE_UPDATE_FORMAT;
  updatedAt: string;
  publisherId: string;
  person: Pick<TeamMember, "name" | "role" | "initials" | "status" | "note" | "until" | "source">;
};

const statuses: Presence[] = ["available", "busy", "away", "offline"];

function boundedText(value: unknown, maxLength: number, required = false): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if ((required && !text) || text.length > maxLength) return undefined;
  return text;
}

/** A share file deliberately excludes calendar events, contact tools, and any message content. */
export function createPresenceUpdate(state: RosterState, now = new Date()): PresenceUpdate {
  const { name, role, initials, status, note, until, source } = state.me;
  return {
    format: PRESENCE_UPDATE_FORMAT,
    updatedAt: now.toISOString(),
    publisherId: state.shareId || "unassigned",
    person: { name, role, initials, status, note, until, source }
  };
}

export function parsePresenceUpdate(input: string): PresenceUpdate | null {
  try {
    const update = JSON.parse(input) as Partial<PresenceUpdate>;
    const person = update.person;
    const publisherId = boundedText(update.publisherId, 80, true);
    const updatedAt = boundedText(update.updatedAt, 100, true);
    const name = boundedText(person?.name, 50, true);
    const role = boundedText(person?.role, 50);
    const note = boundedText(person?.note, 80);
    const until = person?.until === undefined ? undefined : boundedText(person.until, 100, true);
    if (update.format !== PRESENCE_UPDATE_FORMAT || !person || !publisherId || !updatedAt || Number.isNaN(Date.parse(updatedAt)) || !name || role === undefined || note === undefined ||
      !statuses.includes(person.status as Presence) || !["manual", "calendar"].includes(person.source || "") || (person.until !== undefined && !until)) return null;
    return {
      format: PRESENCE_UPDATE_FORMAT,
      updatedAt: new Date(updatedAt).toISOString(),
      publisherId,
      person: {
        name, role, initials: initialsFor(name),
        status: person.status as Presence, note, ...(until ? { until } : {}), source: person.source as "manual" | "calendar"
      }
    };
  } catch { return null; }
}

/** Apply one voluntarily shared status to the receiving device's local roster. */
export function applyPresenceUpdate(state: RosterState, update: PresenceUpdate): RosterState {
  const existing = state.members.find(member => member.sharedFrom === update.publisherId);
  const baseId = `shared-${update.publisherId}`;
  let id = existing?.id || baseId;
  let suffix = 2;
  while (!existing && state.members.some(member => member.id === id)) id = `${baseId}-${suffix++}`;
  const member: TeamMember = {
    id,
    sharedFrom: update.publisherId,
    ...update.person,
    tools: existing?.tools || []
  };
  return {
    ...state,
    members: existing ? state.members.map(item => item.id === existing.id ? member : item) : [...state.members, member]
  };
}
