export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

export function normalizeE164(input: string): string {
  const digits = digitsOnly(input);
  if (!digits) return "";
  return `+${digits}`;
}

export function isE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value);
}

export function displayE164(e164: string): string {
  if (e164.startsWith("+61") && e164.length === 12) {
    const d = e164.slice(3);
    return `+61 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  if (e164.startsWith("+44") && e164.length >= 12) {
    const d = e164.slice(3);
    return `+44 ${d.slice(0, 4)} ${d.slice(4)}`;
  }
  if (e164.startsWith("+1") && e164.length === 12) {
    const d = e164.slice(2);
    return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return e164;
}

export function localFormat(e164: string): string | null {
  if (e164.startsWith("+61") && e164.length === 12) {
    const d = e164.slice(3);
    return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }
  return null;
}

export function inboxPath(id: string): string {
  return `/n/${digitsOnly(id)}`;
}
