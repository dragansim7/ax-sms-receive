import { getSql, type Sql } from "@/lib/db";
import { isE164, normalizeE164 } from "@/lib/sms/format";
import { startPoller } from "@/lib/sms/poller.server";
import type { InboxPayload, NumberCard, SetupInfo, SmsMessage } from "@/lib/sms/types";

startPoller();

const CAP = 40;

type NumberRow = {
  id: string;
  e164: string;
  country_code: string;
  country_name: string;
  label: string;
  carrier: string;
  day_count: number;
  last_at: string | null;
  preview: string | null;
  sender_name: string | null;
};

function mapNumber(row: NumberRow): NumberCard {
  return {
    id: row.id,
    e164: row.e164,
    countryCode: row.country_code,
    countryName: row.country_name,
    label: row.label,
    carrier: row.carrier,
    dayCount: Number(row.day_count ?? 0),
    lastAt: row.last_at,
    preview: row.preview,
    senderName: row.sender_name,
  };
}

async function prune(sql: Sql) {
  await sql.query(
    `delete from messages where received_at < now() - interval '48 hours'`,
  );
}

const NUMBER_SELECT = `
  select
    n.id,
    n.e164,
    n.country_code,
    n.country_name,
    n.label,
    n.carrier,
    coalesce(day.day_count, 0) as day_count,
    last.last_at,
    last.preview,
    last.sender_name
  from numbers n
  left join lateral (
    select
      to_char(m.received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as last_at,
      m.body as preview,
      m.sender_name
    from messages m
    where m.number_id = n.id
    order by m.received_at desc
    limit 1
  ) last on true
  left join lateral (
    select count(*)::int as day_count
    from messages m
    where m.number_id = n.id
      and m.received_at > now() - interval '24 hours'
  ) day on true
`;

export async function freshCounts(seen: Record<string, string>): Promise<Record<string, number>> {
  const sql = await getSql();
  const ids = Object.keys(seen).slice(0, 40);
  const out: Record<string, number> = {};
  await Promise.all(
    ids.map(async (id) => {
      const since = seen[id];
      if (!since) {
        out[id] = 0;
        return;
      }
      const rows = await sql.query<{ n: number }>(
        `select count(*)::int as n from messages where number_id = $1 and received_at > $2::timestamptz`,
        [id, since],
      );
      out[id] = Number(rows[0]?.n ?? 0);
    }),
  );
  return out;
}

export async function listNumberCards(): Promise<NumberCard[]> {
  void import("./anosim.server").then((m) => m.syncAnosim()).catch(() => undefined);
  void import("./receivesmss.server").then((m) => m.syncReceiveSmss()).catch(() => undefined);
  const sql = await getSql();
  await prune(sql);
  const rows = await sql.query<NumberRow>(
    `${NUMBER_SELECT}
     where n.active = true
     order by (n.country_code = 'AU') desc, last.last_at desc nulls last, n.label asc`,
  );
  return rows.map(mapNumber);
}

export async function readInbox(digits: string): Promise<InboxPayload | null> {
  const id = digits.replace(/\D/g, "");
  if (!id) return null;
  if (id === "61485841378") {
    void import("./anosim.server").then((m) => m.syncAnosim()).catch(() => undefined);
  }
  const { RECEIVESMSS_IDS, syncReceiveSmss } = await import("./receivesmss.server");
  if (RECEIVESMSS_IDS.has(id)) {
    void syncReceiveSmss(id);
  }
  const sql = await getSql();
  await prune(sql);
  const rows = await sql.query<NumberRow>(
    `${NUMBER_SELECT} where n.id = $1 and n.active = true`,
    [id],
  );
  const number = rows[0];
  if (!number) return null;
  const messages = await sql.query<{
    id: number;
    from_number: string;
    sender_name: string;
    body: string;
    received_at: string;
    source: string;
  }>(
    `select
       id,
       from_number,
       sender_name,
       body,
       to_char(received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as received_at,
       source
     from messages
     where number_id = $1
     order by received_at desc
     limit 50`,
    [id],
  );
  const mapped: SmsMessage[] = messages.map((m) => ({
    id: Number(m.id),
    fromNumber: m.from_number,
    senderName: m.sender_name,
    body: m.body,
    receivedAt: m.received_at,
    source: m.source,
  }));
  return { number: mapNumber(number), messages: mapped };
}

function cleanBody(body: string, max: number): string {
  return body.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}

export async function insertSms(input: {
  numberId: string;
  fromNumber: string;
  senderName: string;
  body: string;
  source: "sim" | "webhook";
}): Promise<SmsMessage> {
  const sql = await getSql();
  const body = cleanBody(input.body, input.source === "sim" ? 320 : 640);
  if (!body) throw new Error("Message is empty");
  const fromNumber = input.fromNumber.trim().slice(0, 32) || "Unknown";
  const senderName = input.senderName.trim().slice(0, 40);

  if (input.source === "sim") {
    const recent = await sql.query<{ recent: number }>(
      `select count(*)::int as recent
       from messages
       where number_id = $1
         and source = 'sim'
         and received_at > now() - interval '3 seconds'`,
      [input.numberId],
    );
    if (Number(recent[0]?.recent ?? 0) > 0) {
      throw new Error("Wait a few seconds before sending another test");
    }
  } else {
    const burst = await sql.query<{ recent: number }>(
      `select count(*)::int as recent
       from messages
       where number_id = $1
         and received_at > now() - interval '1 minute'`,
      [input.numberId],
    );
    if (Number(burst[0]?.recent ?? 0) >= 20) {
      throw new Error("This line is receiving too fast");
    }
  }

  const rows = await sql.query<{
    id: number;
    from_number: string;
    sender_name: string;
    body: string;
    received_at: string;
    source: string;
  }>(
    `insert into messages (number_id, from_number, sender_name, body, source)
     values ($1, $2, $3, $4, $5)
     returning
       id,
       from_number,
       sender_name,
       body,
       to_char(received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as received_at,
       source`,
    [input.numberId, fromNumber, senderName, body, input.source],
  );
  const row = rows[0];
  if (!row) throw new Error("Could not store the message");
  return {
    id: Number(row.id),
    fromNumber: row.from_number,
    senderName: row.sender_name,
    body: row.body,
    receivedAt: row.received_at,
    source: row.source,
  };
}

export async function acceptInbound(to: string, from: string, body: string): Promise<SmsMessage> {
  const e164 = normalizeE164(to);
  if (!isE164(e164)) throw new Error("Unknown destination");
  const id = e164.slice(1);
  const sql = await getSql();
  const found = await sql.query<{ id: string }>(
    `select id from numbers where id = $1 and active = true`,
    [id],
  );
  if (!found[0]) throw new Error("Unknown destination");
  const senderName = guessSender(from, body);
  return insertSms({
    numberId: id,
    fromNumber: normalizeE164(from) || from.slice(0, 32) || "Unknown",
    senderName,
    body,
    source: "webhook",
  });
}

function guessSender(from: string, body: string): string {
  const hay = `${from} ${body}`.toLowerCase();
  const known = ["telegram", "google", "discord", "instagram", "signal", "whatsapp"];
  for (const name of known) {
    if (hay.includes(name)) return name[0]!.toUpperCase() + name.slice(1);
  }
  return "";
}

const COUNTRIES: Record<string, string> = {
  AU: "Australia",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  NZ: "New Zealand",
  DE: "Germany",
  NL: "Netherlands",
};

export async function addNumber(input: {
  e164: string;
  label: string;
  countryCode: string;
  carrier: string;
}): Promise<NumberCard> {
  const e164 = normalizeE164(input.e164);
  if (!isE164(e164)) throw new Error("Use a full international number, like +61468001999");
  const countryCode = input.countryCode.toUpperCase();
  const countryName = COUNTRIES[countryCode];
  if (!countryName) throw new Error("Pick a supported country");
  const label = input.label.trim().slice(0, 40);
  if (label.length < 2) throw new Error("Give the line a short name");
  const carrier = input.carrier.trim().slice(0, 40) || "Virtual";
  const id = e164.slice(1);
  const sql = await getSql();
  const countRows = await sql.query<{ n: number }>(`select count(*)::int as n from numbers`);
  if (Number(countRows[0]?.n ?? 0) >= CAP) {
    throw new Error("The pool is full");
  }
  const existing = await sql.query<{ id: string }>(`select id from numbers where id = $1`, [id]);
  if (existing[0]) throw new Error("That number is already in the pool");
  await sql.query(
    `insert into numbers (id, e164, country_code, country_name, label, carrier)
     values ($1, $2, $3, $4, $5, $6)`,
    [id, e164, countryCode, countryName, label, carrier],
  );
  const rows = await sql.query<NumberRow>(`${NUMBER_SELECT} where n.id = $1`, [id]);
  const row = rows[0];
  if (!row) throw new Error("Could not add the number");
  return mapNumber(row);
}

export async function removeNumbers(ids: string[]): Promise<number> {
  const clean = [...new Set(ids.map((id) => id.replace(/\D/g, "").slice(0, 16)).filter(Boolean))];
  if (clean.length === 0) return 0;
  const sql = await getSql();
  await sql.query(`delete from messages where number_id = any($1::text[])`, [clean]);
  const rows = await sql.query<{ id: string }>(
    `delete from numbers where id = any($1::text[]) returning id`,
    [clean],
  );
  return rows.length;
}

export async function readSetup(): Promise<SetupInfo> {
  const sql = await getSql();
  const rows = await sql.query<{ n: number }>(
    `select count(*)::int as n from numbers where active = true`,
  );
  return {
    secretConfigured: Boolean(process.env.SMS_WEBHOOK_SECRET?.trim()),
    numberCount: Number(rows[0]?.n ?? 0),
    cap: CAP,
  };
}

export function webhookAuthorized(request: Request): boolean {
  const expected = process.env.SMS_WEBHOOK_SECRET?.trim();
  if (!expected) return true;
  return request.headers.get("x-relay-secret") === expected;
}
