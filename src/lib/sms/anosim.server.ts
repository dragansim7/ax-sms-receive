import { getSql } from "@/lib/db";

const NUMBER_ID = "61485841378";
const SOURCE_URL = "https://anosim.net/online-sms/messages?number=%2B61485841378";
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
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTime(raw: string): Date {
  const match = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return new Date();
  let hour = Number(match[4]);
  const ampm = match[6]!.toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  const iso = `${match[3]}-${match[1]!.padStart(2, "0")}-${match[2]!.padStart(2, "0")}T${String(hour).padStart(2, "0")}:${match[5]}:00+11:00`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() > Date.now() + 5 * 60_000) return new Date();
  return date;
}

function parseMessages(html: string): Parsed[] {
  const blocks = html.split('<div class="list-group-item message-item">').slice(1);
  const out: Parsed[] = [];
  for (const block of blocks) {
    const sender = decode(block.match(/<h6[^>]*>([\s\S]*?)<\/h6>/)?.[1] ?? "");
    const when = decode(block.match(/<small[^>]*>([\s\S]*?)<\/small>/)?.[1] ?? "");
    const body = decode(block.match(/<p class="mb-0">([\s\S]*?)<\/p>/)?.[1] ?? "");
    if (!body) continue;
    out.push({ sender: sender.slice(0, 40) || "Anosim", body: body.slice(0, 640), at: parseTime(when) });
  }
  return out;
}

async function pull(): Promise<number> {
  const sql = await getSql();
  const found = await sql.query<{ id: string }>(
    `select id from numbers where id = $1 and active = true`,
    [NUMBER_ID],
  );
  if (!found[0]) return 0;

  const response = await fetch(SOURCE_URL, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Accept: "text/html",
      "User-Agent": "Relay/1.0",
    },
  });
  if (!response.ok) return 0;
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
      [NUMBER_ID, message.sender, message.body, message.at.toISOString()],
    );
    if (existing[0]) continue;
    await sql.query(
      `insert into messages (number_id, from_number, sender_name, body, source, received_at)
       values ($1, $2, $3, $4, 'anosim', $5)`,
      [NUMBER_ID, "+61485841378", message.sender, message.body, message.at.toISOString()],
    );
    added += 1;
  }
  return added;
}

/** Pull new public messages for the wired Anosim line. Throttled and shared. */
export function syncAnosim(): Promise<number> {
  const now = Date.now();
  if (inflight) return inflight;
  if (now - lastFetch < MIN_GAP_MS) return Promise.resolve(0);
  lastFetch = now;
  inflight = pull()
    .catch(() => 0)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}
