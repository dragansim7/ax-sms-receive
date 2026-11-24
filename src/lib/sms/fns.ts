import { createServerFn } from "@tanstack/react-start";
import type { InboxPayload, NumberCard, SetupInfo, SmsMessage } from "@/lib/sms/types";

export const getFreshCounts = createServerFn({ method: "POST" })
  .validator((seen: Record<string, string>) => {
    const out: Record<string, string> = {};
    if (!seen || typeof seen !== "object") return out;
    for (const [id, iso] of Object.entries(seen).slice(0, 40)) {
      const clean = String(id ?? "").replace(/\D/g, "").slice(0, 16);
      const when = String(iso ?? "");
      if (clean && !Number.isNaN(Date.parse(when))) out[clean] = when;
    }
    return out;
  })
  .handler(async ({ data }): Promise<Record<string, number>> => {
    const { freshCounts } = await import("./store.server");
    return freshCounts(data);
  });

export const listNumbers = createServerFn({ method: "GET" }).handler(async () => {
  const { listNumberCards } = await import("./store.server");
  return listNumberCards();
});

export const getInbox = createServerFn({ method: "GET" })
  .validator((digits: string) => digits.replace(/\D/g, "").slice(0, 16))
  .handler(async ({ data }): Promise<InboxPayload | null> => {
    const { readInbox } = await import("./store.server");
    return readInbox(data);
  });

export const sendTest = createServerFn({ method: "POST" })
  .validator((input: { numberId: string; fromNumber: string; senderName: string; body: string }) => ({
    numberId: String(input.numberId ?? "").replace(/\D/g, "").slice(0, 16),
    fromNumber: String(input.fromNumber ?? "").slice(0, 32),
    senderName: String(input.senderName ?? "").slice(0, 40),
    body: String(input.body ?? "").slice(0, 320),
  }))
  .handler(async ({ data }): Promise<SmsMessage> => {
    const { insertSms } = await import("./store.server");
    const sqlMod = await import("@/lib/db");
    const sql = await sqlMod.getSql();
    const found = await sql.query<{ id: string }>(
      `select id from numbers where id = $1 and active = true`,
      [data.numberId],
    );
    if (!found[0]) throw new Error("That line is not in the pool");
    return insertSms({ ...data, source: "sim" });
  });

export const registerNumber = createServerFn({ method: "POST" })
  .validator((input: { e164: string; label: string; countryCode: string; carrier: string }) => ({
    e164: String(input.e164 ?? "").slice(0, 20),
    label: String(input.label ?? "").slice(0, 40),
    countryCode: String(input.countryCode ?? "").slice(0, 2),
    carrier: String(input.carrier ?? "").slice(0, 40),
  }))
  .handler(async ({ data }): Promise<NumberCard> => {
    const { addNumber } = await import("./store.server");
    return addNumber(data);
  });

export const removeNumbers = createServerFn({ method: "POST" })
  .validator((ids: string[]) =>
    (Array.isArray(ids) ? ids : [])
      .map((id) => String(id ?? "").replace(/\D/g, "").slice(0, 16))
      .filter(Boolean)
      .slice(0, 40),
  )
  .handler(async ({ data }): Promise<number> => {
    const { removeNumbers: drop } = await import("./store.server");
    return drop(data);
  });

export const getSetup = createServerFn({ method: "GET" }).handler(async (): Promise<SetupInfo> => {
  const { readSetup } = await import("./store.server");
  return readSetup();
});
