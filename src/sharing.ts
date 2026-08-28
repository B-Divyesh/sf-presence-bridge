import { initialsFor, type Presence, type RosterState, type TeamMember } from "./model";

export const PRESENCE_UPDATE_FORMAT = "presence-bridge-presence-v1";

export type PresenceUpdate = {
  format: typeof PRESENCE_UPDATE_FORMAT;
  updatedAt: string;
  publisherId: string;
  person: Pick<TeamMember, "name" | "role" | "initials" | "status" | "note" | "until" | "source">;
};

const statuses: Presence[] = ["available", "busy", "away", "offline"];

/** A share file deliberately excludes calendar events, contact routes, and any message content. */
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
    if (update.format !== PRESENCE_UPDATE_FORMAT || !person || typeof update.publisherId !== "string" || !update.publisherId ||
      typeof update.updatedAt !== "string" || Number.isNaN(Date.parse(update.updatedAt)) || typeof person.name !== "string" || !person.name.trim() ||
      typeof person.role !== "string" || typeof person.note !== "string" || !statuses.includes(person.status as Presence) ||
      !["manual", "calendar"].includes(person.source || "") || (person.until !== undefined && typeof person.until !== "string")) return null;
    return {
      format: PRESENCE_UPDATE_FORMAT,
      updatedAt: update.updatedAt,
      publisherId: update.publisherId,
      person: {
        name: person.name.trim().slice(0, 50), role: person.role.slice(0, 50), initials: initialsFor(person.name),
        status: person.status as Presence, note: person.note.slice(0, 80), until: person.until, source: person.source as "manual" | "calendar"
      }
    };
  } catch { return null; }
}

/** Apply one voluntarily shared status to the receiving device's local roster. */
export function applyPresenceUpdate(state: RosterState, update: PresenceUpdate): RosterState {
  const existing = state.members.find(member => member.sharedFrom === update.publisherId);
  const member: TeamMember = {
    id: existing?.id || `shared-${update.publisherId}`,
    sharedFrom: update.publisherId,
    ...update.person,
    tools: existing?.tools || []
  };
  return {
    ...state,
    members: existing ? state.members.map(item => item.id === existing.id ? member : item) : [...state.members, member]
  };
}
