import { createFileRoute } from "@tanstack/react-router";
import { acceptInbound, webhookAuthorized } from "@/lib/sms/store.server";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function readPayload(request: Request): Promise<{ to: string; from: string; body: string } | null> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const data = (await request.json()) as Record<string, unknown>;
    const payload = (data.data as { payload?: Record<string, unknown> } | undefined)?.payload;
    if (payload) {
      const toList = payload.to as Array<{ phone_number?: string }> | undefined;
      const fromObj = payload.from as { phone_number?: string } | undefined;
      const to = toList?.[0]?.phone_number ?? "";
      const from = fromObj?.phone_number ?? "";
      const text = String(payload.text ?? "");
      if (to && text) return { to, from, body: text };
    }
    const to = String(data.to ?? data.To ?? "");
    const from = String(data.from ?? data.From ?? "");
    const body = String(data.body ?? data.Body ?? data.text ?? "");
    if (!to || !body) return null;
    return { to, from, body };
  }
  const form = await request.formData();
  const to = String(form.get("To") ?? form.get("to") ?? "");
  const from = String(form.get("From") ?? form.get("from") ?? "");
  const body = String(form.get("Body") ?? form.get("body") ?? "");
  if (!to || !body) return null;
  return { to, from, body };
}

async function handlePost({ request }: { request: Request }) {
  if (!webhookAuthorized(request)) return json({ error: "unauthorized" }, 401);
  try {
    const payload = await readPayload(request);
    if (!payload) return json({ error: "expected to and body" }, 400);
    const message = await acceptInbound(payload.to, payload.from, payload.body);
    return json({ ok: true, id: message.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "rejected";
    const status = message === "This line is receiving too fast" ? 429 : 400;
    return json({ error: message }, status);
  }
}

export const Route = createFileRoute("/api/sms/inbound")({
  server: { handlers: { POST: handlePost } },
});
