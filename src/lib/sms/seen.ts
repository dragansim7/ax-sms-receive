const SEEN_KEY = "relay.seen";
const VISIT_KEY = "relay.visit";

function readJson(key: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

export function getSeen(): Record<string, string> {
  return readJson(SEEN_KEY);
}

export function markSeen(id: string) {
  const seen = getSeen();
  seen[id] = new Date().toISOString();
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
}

export function getLastVisit(): string | null {
  try {
    return localStorage.getItem(VISIT_KEY);
  } catch {
    return null;
  }
}

export function setLastVisit(iso: string) {
  try {
    localStorage.setItem(VISIT_KEY, iso);
  } catch {
    // private mode can block storage; badges just stay empty
  }
}

/** Baseline for a number: the later of the last app visit and the last time it was opened. */
export function baselineFor(id: string): string {
  const visit = getLastVisit();
  const seen = getSeen()[id];
  if (visit && seen) return visit > seen ? visit : seen;
  return seen ?? visit ?? new Date().toISOString();
}
