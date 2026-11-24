import { getSql } from "@/lib/db";

const LINES = [
  { id: "61468279945", e164: "+61468279945" },
  { id: "61485922587", e164: "+61485922587" },
  { id: "61483966924", e164: "+61483966924" },
] as const;

const MIN_GAP_MS = 8_000;

type Parsed = {
  sender: string;
  body: string;
  at: Date;
};

let lastFetch = 0;
let inflight: Promise<number> | null = null;

function decode(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseMessages(html: string): Parsed[] {
  const quoted = "&" + "quot;";
  const doubleQuoted = "&" + "amp;quot;";
  const text = html.replaceAll(doubleQuoted, '"').replaceAll(quoted, '"');
  const pattern =
    /"sender":\[0,"((?:\\.|[^"\\])*)"\],"content":\[0,"((?:\\.|[^"\\])*)"\],"receivedAt":\[0,"([^"]+)"\]/g;
  const out: Parsed[] = [];
  for (const match of text.matchAll(pattern)) {
    const body = decode(match[2] ?? "").slice(0, 640);
    const at = new Date(match[3] ?? "");
    if (!body || Number.isNaN(at.getTime())) continue;
    out.push({ sender: decode(match[1] ?? "").slice(0, 40) || "Unknown", body, at });
  }
  return out;
}

async function pullOne(id: string): Promise<number> {
  const sql = await getSql();
  const found = await sql.query<{ id: string }>(
    `select id from numbers where id = $1 and active = true`,
    [id],
  );
  if (!found[0]) return 0;

  const response = await fetch(`https://receive-smss.live/sms/au/${id}`, {
    headers: {
      Accept: "text/html",
      "User-Agent": "Mozilla/5.0 (compatible; Relay/1.0)",
    },
  });
  if (!response.ok) {
    console.error(`[receivesmss] ${id} http ${response.status}`);
    return 0;
  }
  const html = await response.text();
  const messages = parseMessages(html);
  let added = 0;
  for (const message of messages) {
    const existing = await sql.query<{ id: number }>(
      `select id from messages
       where number_id = $1
         and sender_name = $2
         and body = $3
         and received_at between $4::timestamptz - interval '2 minutes' and $4::timestamptz + interval '2 minutes'
       limit 1`,
      [id, message.sender, message.body, message.at.toISOString()],
    );
    if (existing[0]) continue;
    await sql.query(
      `insert into messages (number_id, from_number, sender_name, body, source, received_at)
       values ($1, $2, $3, $4, 'receivesmss', $5)`,
      [id, message.sender.slice(0, 32), message.sender, message.body, message.at.toISOString()],
    );
    added += 1;
  }
  return added;
}

async function pull(only?: string): Promise<number> {
  const lines = only ? LINES.filter((line) => line.id === only) : LINES;
  const counts = await Promise.all(lines.map((line) => pullOne(line.id).catch((err) => {
    console.error(`[receivesmss] ${line.id} failed`, err);
    return 0;
  })));
  return counts.reduce((sum, n) => sum + n, 0);
}

/** Pull new public messages for the wired receive-smss.live lines. Throttled. */
export function syncReceiveSmss(only?: string): Promise<number> {
  const now = Date.now();
  if (inflight) return inflight;
  if (!only && now - lastFetch < MIN_GAP_MS) return Promise.resolve(0);
  lastFetch = now;
  inflight = pull(only)
    .catch((err) => {
      console.error("[receivesmss] pull failed", err);
      return 0;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export const RECEIVESMSS_IDS: ReadonlySet<string> = new Set(LINES.map((line) => line.id));
