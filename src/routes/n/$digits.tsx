import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Shell } from "@/components/shell";
import { RelTime } from "@/components/rel-time";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { getInbox, sendTest } from "@/lib/sms/fns";
import { displayE164, localFormat } from "@/lib/sms/format";
import { markSeen } from "@/lib/sms/seen";
import type { InboxPayload, SmsMessage } from "@/lib/sms/types";

export const Route = createFileRoute("/n/$digits")({
  head: ({ params }) => ({
    meta: [{ title: `+${params.digits} — Relay` }],
  }),
  loader: async ({ params }): Promise<InboxPayload | null> => getInbox({ data: params.digits }),
  component: InboxPage,
});

const PRESETS = [
  { senderName: "Telegram", fromNumber: "+42777", body: "Telegram code: 184920" },
  { senderName: "Google", fromNumber: "Google", body: "G-184223 is your Google verification code." },
  { senderName: "Discord", fromNumber: "+447781", body: "Your Discord verification code is 091284" },
];

function InboxPage() {
  const initial = Route.useLoaderData() as InboxPayload | null;
  const { digits } = Route.useParams();
  const [payload, setPayload] = useState<InboxPayload | null>(initial);
  const [preset, setPreset] = useState(0);
  const [body, setBody] = useState(PRESETS[0]!.body);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    markSeen(digits);
    const id = window.setInterval(() => {
      getInbox({ data: digits })
        .then((next) => {
          if (next) setPayload(next);
        })
        .catch(() => undefined);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [digits]);

  if (!payload) {
    return (
      <Shell>
        <h1 className="text-title font-semibold">This line is not in the pool.</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-muted">
          Back to numbers
        </Link>
      </Shell>
    );
  }

  const { number, messages } = payload;
  const local = localFormat(number.e164);
  const fresh = number.lastAt ? Date.now() - new Date(number.lastAt).getTime() < 60 * 60 * 1000 : false;

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
      setError("Copy was blocked by the browser");
    }
  }

  async function onSend() {
    setPending(true);
    setError("");
    const chosen = PRESETS[preset] ?? PRESETS[0]!;
    try {
      await sendTest({
        data: {
          numberId: number.id,
          fromNumber: chosen.fromNumber,
          senderName: chosen.senderName,
          body,
        },
      });
      const next = await getInbox({ data: digits });
      if (next) setPayload(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Numbers
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>{number.countryName}</span>
            <span aria-hidden="true">·</span>
            <span>{number.label}</span>
            <span aria-hidden="true">·</span>
            <span>{number.carrier}</span>
            {fresh ? (
              <span className="inline-flex items-center gap-1.5 text-live">
                <span className="status-dot status-dot-live" aria-hidden="true" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-danger">
                <span className="status-dot status-dot-dead" aria-hidden="true" />
                Inactive
              </span>
            )}
          </div>
          <h1 className="mt-2 text-title font-semibold tabular-nums leading-none">{displayE164(number.e164)}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="quiet" onClick={() => copy(number.e164, "intl")}>
            <Copy className="size-4" aria-hidden="true" />
            {copied === "intl" ? "Copied" : "Copy number"}
          </Button>
          {local ? (
            <Button variant="quiet" onClick={() => copy(local.replace(/\s/g, ""), "local")}>
              <Copy className="size-4" aria-hidden="true" />
              {copied === "local" ? "Copied" : "Copy local"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="font-display text-sm font-semibold tracking-tight text-muted">Inbox</h2>
          {messages.length === 0 ? (
            <p className="mt-4 rounded-xl border border-line bg-elevated p-4 text-muted">
              Nothing yet. Send a test, or point your provider webhook at this line.
            </p>
          ) : (
            <ol className="mt-3 divide-y divide-line border-t border-line">
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} />
              ))}
            </ol>
          )}
        </section>

        <aside className="rounded-xl border border-line bg-elevated p-4">
          <h2 className="font-display text-lg font-semibold tracking-tight">Send a test SMS</h2>
          <p className="mt-1 text-sm text-muted">Lands in this inbox like a provider webhook. Refreshes on its own.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((item, index) => (
              <button
                key={item.senderName}
                type="button"
                onClick={() => {
                  setPreset(index);
                  setBody(item.body);
                }}
                className={`h-11 rounded-full px-4 font-display text-sm font-semibold ${
                  preset === index ? "bg-accent text-accent-fg" : "border border-line text-muted"
                }`}
              >
                {item.senderName}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm text-muted" htmlFor="body">
            Message
          </label>
          <Textarea id="body" className="mt-2" value={body} maxLength={320} onChange={(event) => setBody(event.target.value)} />
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
          <Button className="mt-4 w-full" disabled={pending || body.trim().length === 0} onClick={onSend}>
            {pending ? "Sending" : "Deliver to inbox"}
          </Button>
          <p className="mt-4 text-xs text-faint">
            This page is public. <Link to="/connect" className="text-muted underline">Connect a real number</Link> if you need a line you control.
          </p>
        </aside>
      </div>
    </Shell>
  );
}

function MessageRow({ message }: { message: SmsMessage }) {
  return (
    <li className="py-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm font-semibold text-fg">
          {message.senderName || message.fromNumber}
        </p>
        <p className="text-xs text-faint">
          <RelTime iso={message.receivedAt} />
        </p>
      </div>
      <p className="mt-1 text-fg">{message.body}</p>
      <p className="mt-1 text-xs text-faint">
        {message.fromNumber}
        {message.source === "sim" ? " · test" : message.source === "webhook" ? " · webhook" : ""}
      </p>
    </li>
  );
}
