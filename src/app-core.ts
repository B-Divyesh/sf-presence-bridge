import {
  allowedDeepLink,
  applyCalendar,
  emptyState,
  FREE_CONTACT_ROUTE_LIMIT,
  FREE_ROSTER_LIMIT,
  initialsFor,
  nextCalendarBoundary,
  normalizeRosterBackup,
  PAID_CONTACT_ROUTE_LIMIT,
  PAID_ROSTER_LIMIT,
  parseCalendar,
  sampleState,
  type Presence,
  type RosterImportError,
  type RosterState,
  type TeamMember
} from "./model";
import { cachedLicense, checkoutUrl, restoreLicense, verifyLicense } from "./license";
import { applyPresenceUpdate, createPresenceUpdate, parsePresenceUpdate } from "./sharing";

type MountOptions = { demo?: boolean; embedded?: boolean };

const STORE = "presence-bridge:v1";
const DEMO_STORE = "demo:presence-bridge:v1";

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);
}

function loadState(demo: boolean): RosterState {
  const storage = demo ? sessionStorage : localStorage;
  try {
    const value = storage.getItem(demo ? DEMO_STORE : STORE);
    if (!value) return applyCalendar(demo ? sampleState() : emptyState());
    const restored = normalizeRosterBackup(JSON.parse(value), { memberLimit: PAID_ROSTER_LIMIT, contactRouteLimit: PAID_CONTACT_ROUTE_LIMIT });
    return applyCalendar(restored.state || (demo ? sampleState() : emptyState()));
  } catch { return demo ? sampleState() : emptyState(); }
}

const rosterLimit = (paid: boolean): number => paid ? PAID_ROSTER_LIMIT : FREE_ROSTER_LIMIT;
const contactRouteLimit = (paid: boolean): number => paid ? PAID_CONTACT_ROUTE_LIMIT : FREE_CONTACT_ROUTE_LIMIT;

function importErrorMessage(error: RosterImportError): string {
  if (error === "member-limit") return "This import has more people than your plan allows. The free roster holds five people. Bridge Plus raises the limit to ten.";
  if (error === "contact-route-limit") return "This backup has more contact routes than your plan allows. Bridge Plus adds a second contact route.";
  return "That backup could not be read. It was not saved. Choose a valid Presence Bridge JSON file.";
}

function memberRow(member: TeamMember, selected: boolean): string {
  return `<button class="person-row ${selected ? "selected" : ""}" role="option" aria-selected="${selected}" data-member="${esc(member.id)}">
    <span class="avatar" aria-hidden="true">${esc(member.initials)}</span>
    <span class="person-copy"><strong>${esc(member.name)}</strong><span>${esc(member.role || "Team member")}</span></span>
    <span class="presence ${member.status}"><i aria-hidden="true"></i>${member.status}</span>
  </button>`;
}

export function mountPresenceApp(root: HTMLElement, options: MountOptions = {}): () => void {
  const demo = Boolean(options.demo);
  let state = loadState(demo);
  let selectedId = state.members[0]?.id || "";
  let filter = "";
  let notice = "";
  let settingsOpen = false;
  let addOpen = false;
  let license = cachedLicense();
  let returnFocusSelector = "";
  let calendarTimer: number | undefined;
  const storage = demo ? sessionStorage : localStorage;
  const key = demo ? DEMO_STORE : STORE;

  const save = () => {
    if (!state.shareId) state.shareId = crypto.randomUUID();
    storage.setItem(key, JSON.stringify(state));
  };
  const selected = () => state.members.find(member => member.id === selectedId);
  const tell = (message: string) => { notice = message; render(); };

  const render = () => {
    const visible = state.members.filter(member => `${member.name} ${member.role} ${member.status}`.toLowerCase().includes(filter.toLowerCase()));
    const person = selected();
    const heading = options.embedded ? "h2" : "h1";
    root.innerHTML = `<section class="presence-app ${options.embedded ? "embedded" : ""}" aria-label="Presence Bridge roster">
      ${demo ? `<div class="demo-banner"><span><strong>Demo</strong> — sample data, nothing is saved</span><span><button class="text-button" data-action="reset-demo">Reset demo</button><a href="/app.html">Start for real</a></span></div>` : ""}
      <header class="app-bar">
        <a class="app-wordmark" href="${options.embedded ? "/" : "#"}" aria-label="Presence Bridge home"><span aria-hidden="true">⌁</span> Presence Bridge</a>
        <button class="icon-button" data-action="settings" aria-label="Open settings">Settings</button>
      </header>
      <div class="app-layout">
        <${options.embedded ? "section" : "main"} id="${options.embedded ? "roster" : "main"}" class="roster-panel">
          <${heading}>Who is free?</${heading}>
          <section class="my-status" aria-labelledby="your-presence-title">
            <div><p class="eyebrow" id="your-presence-title">Your presence</p><p class="status-summary"><span class="status-light ${state.me.status}"></span><strong>${esc(state.me.status)}</strong>${state.me.note ? ` · ${esc(state.me.note)}` : ""}</p></div>
            <label>Status<select id="own-status" ${state.calendarEnabled ? "disabled" : ""}>
              ${(["available", "busy", "away", "offline"] as Presence[]).map(value => `<option ${state.me.status === value ? "selected" : ""}>${value}</option>`).join("")}
            </select></label>
          </section>
          <div class="roster-tools">
            <label class="search-label" for="roster-search">Find a teammate</label>
            <div class="search-row"><input id="roster-search" type="search" value="${esc(filter)}" placeholder="Name, role, or status" autocomplete="off"><button data-action="add-member">Add person</button></div>
          </div>
          <div class="roster-heading"><span>${visible.length} ${visible.length === 1 ? "person" : "people"}</span><span>↑↓ then Enter</span></div>
          <div class="people" ${visible.length ? `role="listbox" tabindex="0"` : `role="region"`} aria-label="Team roster">
            ${visible.map(member => memberRow(member, member.id === selectedId)).join("") || `<div class="empty-state"><span class="unlit-window" aria-hidden="true"></span><strong>${state.members.length ? "No teammate matches that search." : "Your roster is empty."}</strong><span>${state.members.length ? "Clear the search to see everyone." : "Add a person or load the included sample roster."}</span><div class="inline-actions"><button data-action="${state.members.length ? "clear-search" : "add-member"}">${state.members.length ? "Clear search" : "Add your first person"}</button>${state.members.length || demo ? "" : `<button class="secondary" data-action="load-sample">Load sample project</button>`}</div></div>`}
          </div>
        </${options.embedded ? "section" : "main"}>
        <aside class="detail-panel" aria-label="Selected teammate">
          ${person ? `<div class="detail-person"><span class="large-avatar">${esc(person.initials)}</span><p class="eyebrow">${esc(person.role || "Team member")}</p><h2>${esc(person.name)}</h2><p class="detail-status"><span class="status-light ${person.status}"></span>${esc(person.status)}${person.until ? ` until ${esc(person.until)}` : ""}</p><p>${esc(person.note || "No status note")}</p><p class="source-note">Set ${person.source === "calendar" ? "from an imported calendar" : "manually"}</p></div>
          <div class="handoffs"><h3>Open their tool</h3>${person.tools.length ? person.tools.map((tool, index) => `<button class="handoff ${index === 0 ? "primary" : ""}" data-url="${esc(tool.url)}" data-label="${esc(tool.label)}"><span>${esc(tool.label)}</span><span aria-hidden="true">↗</span></button>`).join("") : `<p>No contact tool is saved.</p>`}<button class="secondary" data-action="edit-member">Edit person</button><button class="danger-text" data-action="delete-member">Remove from roster</button></div>` : `<div class="detail-empty"><span class="window-mark" aria-hidden="true"></span><h2>Select a teammate</h2><p>Their current note and contact tools will appear here.</p></div>`}
        </aside>
      </div>
      <div class="toast" aria-live="polite" aria-atomic="true">${esc(notice)}</div>
      ${addOpen ? memberDialog(person, license.valid) : ""}
      ${settingsOpen ? settingsDialog(state, license.valid, demo) : ""}
    </section>`;
    bind();
    if (returnFocusSelector && !addOpen && !settingsOpen) {
      const selector = returnFocusSelector; returnFocusSelector = "";
      // Native dialog cancellation restores focus after the cancel event; wait one task so it cannot overwrite our explicit return target.
      setTimeout(() => root.querySelector<HTMLElement>(selector)?.focus(), 0);
    }
    scheduleCalendarBoundary();
  };

  const bind = () => {
    root.querySelector<HTMLSelectElement>("#own-status")?.addEventListener("change", event => {
      state.me = { ...state.me, status: (event.target as HTMLSelectElement).value as Presence, source: "manual" };
      save(); tell(`Your status is now ${state.me.status}.`);
    });
    const search = root.querySelector<HTMLInputElement>("#roster-search");
    search?.addEventListener("input", () => { filter = search.value; render(); root.querySelector<HTMLInputElement>("#roster-search")?.focus(); });
    root.querySelectorAll<HTMLElement>("[data-member]").forEach(button => button.addEventListener("click", () => { selectedId = button.dataset.member || ""; render(); }));
    root.querySelector<HTMLElement>(".people")?.addEventListener("keydown", event => {
      const rows = [...root.querySelectorAll<HTMLElement>("[data-member]")];
      let index = rows.findIndex(row => row.dataset.member === selectedId);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault(); index = Math.max(0, Math.min(rows.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
        selectedId = rows[index]?.dataset.member || selectedId; render(); root.querySelector<HTMLElement>(".people")?.focus();
      }
      if (event.key === "Enter") root.querySelector<HTMLButtonElement>(".handoff")?.click();
    });
    root.querySelectorAll<HTMLElement>("[data-action]").forEach(element => element.addEventListener("click", () => action(element.dataset.action || "")));
    root.querySelector<HTMLFormElement>("#member-form")?.addEventListener("submit", saveMember);
    root.querySelector<HTMLFormElement>("#settings-form")?.addEventListener("submit", saveSettings);
    root.querySelector<HTMLInputElement>("#calendar-file")?.addEventListener("change", importCalendar);
    root.querySelector<HTMLInputElement>("#import-roster")?.addEventListener("change", importRoster);
    root.querySelector<HTMLInputElement>("#import-presence")?.addEventListener("change", importPresence);
    root.querySelector<HTMLFormElement>("#license-form")?.addEventListener("submit", submitLicense);
    root.querySelectorAll<HTMLDialogElement>("dialog").forEach(dialog => {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector<HTMLElement>("input,select,button")?.focus();
      dialog.addEventListener("cancel", event => { event.preventDefault(); closeDialog(); });
    });
  };

  const action = (name: string) => {
    if (name === "settings") { settingsOpen = true; returnFocusSelector = '[data-action="settings"]'; }
    if (name === "close-settings") { settingsOpen = false; }
    if (name === "add-member") { addOpen = true; selectedId = ""; returnFocusSelector = '[data-action="add-member"]'; }
    if (name === "edit-member") { addOpen = true; returnFocusSelector = '[data-action="edit-member"]'; }
    if (name === "close-member") { addOpen = false; }
    if (name === "clear-search") filter = "";
    if (name === "reset-demo") { sessionStorage.removeItem(DEMO_STORE); state = sampleState(); selectedId = state.members[0].id; notice = "Demo reset to its starting state."; }
    if (name === "load-sample") { state = sampleState(); selectedId = state.members[0].id; save(); notice = "Sample roster loaded. You can edit or remove every person."; }
    const current = selected();
    if (name === "delete-member" && current && confirm(`Remove ${current.name} from this local roster?`)) { state.members = state.members.filter(item => item.id !== current.id); selectedId = state.members[0]?.id || ""; save(); notice = `${current.name} was removed.`; }
    if (name === "export") exportRoster();
    if (name === "export-presence") exportPresence();
    render();
  };

  const closeDialog = () => {
    if (addOpen) addOpen = false;
    if (settingsOpen) settingsOpen = false;
    render();
  };

  const saveMember = (event: SubmitEvent) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const name = String(data.get("name") || "").trim();
    const url = String(data.get("url") || "").trim();
    const label = String(data.get("tool") || "Contact").trim();
    if (!name || !allowedDeepLink(url)) return tell("Enter a name and a supported contact link, such as mailto: or https:.");
    const existing = selected();
    if (!existing && state.members.length >= rosterLimit(license.valid)) return tell("The free roster holds five people. Bridge Plus raises the limit to ten.");
    const secondUrl = String(data.get("url-2") || "").trim();
    const secondLabel = String(data.get("tool-2") || "").trim();
    const tools = [{ id: existing?.tools[0]?.id || crypto.randomUUID(), label, url }];
    if (license.valid && secondUrl && secondLabel) {
      if (!allowedDeepLink(secondUrl)) return tell("The second contact link is not supported.");
      tools.push({ id: existing?.tools[1]?.id || crypto.randomUUID(), label: secondLabel, url: secondUrl });
    } else if (license.valid && existing?.tools[1]) tools.push(existing.tools[1]);
    const member: TeamMember = {
      id: existing?.id || crypto.randomUUID(), name, role: String(data.get("role") || "").trim(), initials: initialsFor(name),
      status: String(data.get("status") || "available") as Presence, note: String(data.get("note") || "").trim(), source: "manual",
      sharedFrom: existing?.sharedFrom,
      tools
    };
    if (existing) state.members = state.members.map(item => item.id === existing.id ? member : item);
    else state.members = [...state.members, member];
    selectedId = member.id; addOpen = false; save(); tell(`${member.name} was saved.`);
  };

  const saveSettings = (event: SubmitEvent) => {
    event.preventDefault(); const data = new FormData(event.currentTarget as HTMLFormElement);
    state.me = { ...state.me, name: String(data.get("my-name") || "You").trim(), role: String(data.get("my-role") || "").trim(), note: String(data.get("my-note") || "").trim() };
    state.calendarEnabled = data.get("calendar-enabled") === "on";
    state = applyCalendar(state); settingsOpen = false; save(); tell("Settings saved on this device.");
  };

  const importCalendar = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    const events = parseCalendar(await file.text());
    if (!events.length) return tell("No calendar events were found. Choose a valid .ics export.");
    state.calendar = events; state.calendarEnabled = true; state = applyCalendar(state); save(); tell(`Imported ${events.length} calendar ${events.length === 1 ? "event" : "events"}.`);
  };

  const exportRoster = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "presence-bridge-roster.json"; link.click(); URL.revokeObjectURL(link.href);
    tell("Roster backup downloaded.");
  };

  const exportPresence = () => {
    if (!state.shareId) save();
    const update = createPresenceUpdate(state);
    const blob = new Blob([JSON.stringify(update, null, 2)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "presence-bridge-availability.json"; link.click(); URL.revokeObjectURL(link.href);
    notice = "Presence update downloaded. Share this file only with teammates who should see it.";
  };

  const importPresence = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    const update = parsePresenceUpdate(await file.text());
    if (!update) return tell("That presence update could not be read. Choose a Presence Bridge availability file.");
    const existing = state.members.some(member => member.sharedFrom === update.publisherId);
    if (!existing && state.members.length >= rosterLimit(license.valid)) return tell("This import has more people than your plan allows. The free roster holds five people. Bridge Plus raises the limit to ten.");
    state = applyPresenceUpdate(state, update); selectedId = state.members.find(member => member.sharedFrom === update.publisherId)?.id || selectedId;
    save(); tell(`${update.person.name}'s chosen presence was added to this local roster.`);
  };

  const importRoster = async (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
    try {
      const imported = normalizeRosterBackup(JSON.parse(await file.text()), {
        memberLimit: rosterLimit(license.valid),
        contactRouteLimit: contactRouteLimit(license.valid)
      });
      if (!imported.state) return tell(importErrorMessage(imported.error));
      state = imported.state; selectedId = state.members[0]?.id || ""; save(); tell("Roster backup imported.");
    } catch { tell(importErrorMessage("invalid")); }
  };

  const submitLicense = async (event: SubmitEvent) => {
    event.preventDefault(); const form = event.currentTarget as HTMLFormElement; const token = String(new FormData(form).get("license") || "");
    notice = "Checking the license…"; render(); license = await restoreLicense(token); settingsOpen = true;
    tell(license.valid ? "Bridge Plus is active." : "That license is not active. Check the token and try again.");
  };

  const keyboard = (event: KeyboardEvent) => {
    if (event.key === "/" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); root.querySelector<HTMLInputElement>("#roster-search")?.focus(); }
    if (event.key === "Escape" && (addOpen || settingsOpen)) { event.preventDefault(); closeDialog(); }
  };
  const refreshCalendar = () => {
    if (!state.calendarEnabled) return;
    state = applyCalendar(state);
    render();
  };
  const scheduleCalendarBoundary = () => {
    if (calendarTimer !== undefined) window.clearTimeout(calendarTimer);
    const boundary = nextCalendarBoundary(state);
    if (!boundary) { calendarTimer = undefined; return; }
    calendarTimer = window.setTimeout(refreshCalendar, Math.max(0, boundary.getTime() - Date.now()) + 30);
  };
  const refreshOnResume = () => {
    if (document.visibilityState === "visible") refreshCalendar();
  };
  const handoff = async (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-url]");
    if (!button || !root.contains(button)) return;
    const url = button.dataset.url || "";
    const current = selected();
    if (!allowedDeepLink(url)) return tell("That link is not supported. Edit the person and choose a documented tool link.");
    notice = `Opening ${button.dataset.label} for ${current?.name}.`;
    const liveNotice = root.querySelector<HTMLElement>(".toast");
    if (liveNotice) liveNotice.textContent = notice;
    if (demo) return;
    try {
      if ((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__) {
        const { openUrl } = await import("@tauri-apps/plugin-opener"); await openUrl(url);
      } else window.open(url, "_blank", "noopener,noreferrer");
    } catch { tell(`Could not open ${button.dataset.label}. Check that the app is installed.`); }
  };
  document.addEventListener("keydown", keyboard);
  document.addEventListener("visibilitychange", refreshOnResume);
  window.addEventListener("focus", refreshCalendar);
  root.addEventListener("click", handoff);
  render();
  if (!demo && localStorage.getItem("sb_license:presence-bridge")) verifyLicense().then(result => { license = result; render(); });
  return () => {
    if (calendarTimer !== undefined) window.clearTimeout(calendarTimer);
    document.removeEventListener("keydown", keyboard);
    document.removeEventListener("visibilitychange", refreshOnResume);
    window.removeEventListener("focus", refreshCalendar);
    root.removeEventListener("click", handoff);
  };
}

function memberDialog(member: TeamMember | undefined, paid: boolean): string {
  return `<dialog aria-labelledby="member-title"><form method="dialog" id="member-form"><div class="dialog-head"><h2 id="member-title">${member ? "Edit person" : "Add a person"}</h2><button type="button" class="icon-button" data-action="close-member" aria-label="Close">Close</button></div>
    <label>Name<input name="name" required maxlength="50" value="${esc(member?.name || "")}"></label>
    <label>Role<input name="role" maxlength="50" value="${esc(member?.role || "")}"></label>
    <label>Status<select name="status">${["available", "busy", "away", "offline"].map(value => `<option ${member?.status === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
    <label>Status note<input name="note" maxlength="80" value="${esc(member?.note || "")}"></label>
    <div class="form-pair"><label>Tool name<input name="tool" required maxlength="24" value="${esc(member?.tools[0]?.label || "Email")}"></label><label>Contact link<input name="url" required value="${esc(member?.tools[0]?.url || "mailto:")}" aria-describedby="link-help"></label></div>
    <p class="field-help" id="link-help">Use a documented mailto, https, Slack, Teams, Zoom, or phone link.</p>
    ${paid ? `<div class="form-pair"><label>Second tool name<input name="tool-2" maxlength="24" value="${esc(member?.tools[1]?.label || "")}"></label><label>Second contact link<input name="url-2" value="${esc(member?.tools[1]?.url || "")}"></label></div>` : ""}
    <div class="dialog-actions"><button type="button" class="secondary" data-action="close-member">Cancel</button><button type="submit">Save person</button></div>
  </form></dialog>`;
}

function settingsDialog(state: RosterState, paid: boolean, demo: boolean): string {
  return `<dialog aria-labelledby="settings-title"><div class="dialog-scroll"><div class="dialog-head"><h2 id="settings-title">Settings</h2><button type="button" class="icon-button" data-action="close-settings" aria-label="Close">Close</button></div>
    <form id="settings-form"><label>Your name<input name="my-name" value="${esc(state.me.name)}"></label><label>Your role<input name="my-role" value="${esc(state.me.role)}"></label><label>Your note<input name="my-note" maxlength="80" value="${esc(state.me.note)}"></label>
      <label class="check"><input name="calendar-enabled" type="checkbox" ${state.calendarEnabled ? "checked" : ""}> Let imported calendar events set busy status</label>
      <label class="file-label">Import an .ics calendar<input id="calendar-file" type="file" accept=".ics,text/calendar"></label>
      <p class="field-help">Calendar data stays in this local roster. Nothing is uploaded.</p>
      <button type="submit">Save settings</button>
    </form>
    <section class="settings-section"><h3>Back up this roster</h3><p>Download or restore a readable JSON file.</p><div class="inline-actions"><button data-action="export">Download backup</button><label class="file-label secondary">Import backup<input id="import-roster" type="file" accept="application/json"></label></div></section>
    <section class="settings-section"><h3>Share your chosen presence</h3><p>Download a small availability file, then send it through a shared folder or your existing tool. Import a teammate's file to update this local roster. Nothing sends automatically.</p><p class="field-help">The file includes only their name, role, status, note, status source, and update time. It never includes calendar events, contact routes, activity, or messages.</p><div class="inline-actions"><button data-action="export-presence">Download presence update</button><label class="file-label secondary">Import presence update<input id="import-presence" type="file" accept="application/json,.presence.json"></label></div></section>
    <section class="settings-section"><p class="eyebrow">Bridge Plus · $24 once</p><h3>${paid ? "Bridge Plus is active" : "Add room for a larger team"}</h3><p>Keep up to ten people and add more contact routes in the desktop app. Free rosters hold five people.</p>${paid ? "" : `<a class="button-link" href="${checkoutUrl}">Buy Bridge Plus</a><form id="license-form"><label>Have a license?<input name="license" required autocomplete="off"></label><button type="submit">Verify license</button></form>`}<p class="field-help">Sociobot is the merchant of record. See <a href="/terms">terms</a> and <a href="/privacy">privacy</a>.</p></section>
    ${demo ? `<p class="field-help">Demo changes use the temporary ${DEMO_STORE} session namespace.</p>` : ""}</div></dialog>`;
}
