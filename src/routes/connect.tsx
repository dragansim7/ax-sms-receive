import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { getSetup, registerNumber } from "@/lib/sms/fns";

const COUNTRIES = [
  { code: "AU", name: "Australia" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "NZ", name: "New Zealand" },
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
];

export const Route = createFileRoute("/connect")({
  head: () => ({ meta: [{ title: "Connect a number — Relay" }] }),
  loader: () => getSetup(),
  component: ConnectPage,
});

function ConnectPage() {
  const setup = Route.useLoaderData();
  const navigate = useNavigate();
  const [e164, setE164] = useState("+61");
  const [label, setLabel] = useState("");
  const [countryCode, setCountryCode] = useState("AU");
  const [carrier, setCarrier] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const number = await registerNumber({ data: { e164, label, countryCode, carrier } });
      await navigate({ to: "/n/$digits", params: { digits: number.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add that number");
      setPending(false);
    }
  }

  return (
    <Shell>
      <section className="max-w-2xl">
        <p className="font-display text-sm font-semibold tracking-tight text-muted">Connect</p>
        <h1 className="mt-2 text-hero font-semibold leading-tight">Point a real number at Relay.</h1>
        <p className="mt-4 text-muted">
          Rent a mobile number from Twilio, Telnyx, or Vonage. Add it here, then set that provider’s SMS webhook to this app. Inbound texts show up on the public inbox for that line.
        </p>
      </section>

      <ol className="mt-8 grid gap-3 sm:grid-cols-3">
        <Step n="1" title="Buy a mobile line" body="It has to be a real SMS-capable number, not a landline. Australian mobiles look like +61 4xx xxx xxx." />
        <Step n="2" title="Register it" body="Relay only stores messages for numbers in this pool, so unknown destinations are rejected." />
        <Step n="3" title="Set the webhook" body="POST form fields To, From, and Body, or JSON with to, from, and body. Telnyx’s message payload works too." />
      </ol>

      <section className="mt-8 rounded-xl border border-line bg-elevated p-4">
        <h2 className="font-display text-lg font-semibold">Webhook</h2>
        <p className="mt-2 text-sm text-muted">
          Path <span className="font-display text-fg">/api/sms/inbound</span>
          {" · "}
          {setup.secretConfigured
            ? "A shared secret is set. Send it as the x-relay-secret header."
            : "No shared secret is configured, so the webhook is open for numbers already in the pool."}
        </p>
        <pre className="mt-4 overflow-x-auto rounded-md bg-bg p-3 text-sm text-muted">
{`POST /api/sms/inbound
Content-Type: application/x-www-form-urlencoded

To=%2B61400000000&From=%2B42777&Body=Your+code+is+184920`}
        </pre>
      </section>

      <form onSubmit={onSubmit} className="mt-8 max-w-lg rounded-xl border border-line p-4">
        <h2 className="font-display text-lg font-semibold">Add a line</h2>
        <p className="mt-1 text-sm text-muted">
          {setup.numberCount} of {setup.cap} slots used. Adding a number does not buy it. You still need the carrier to deliver SMS here.
        </p>
        <label className="mt-4 block text-sm text-muted" htmlFor="e164">
          Number
        </label>
        <Input id="e164" className="mt-2" value={e164} onChange={(event) => setE164(event.target.value)} inputMode="tel" autoComplete="off" />
        <label className="mt-4 block text-sm text-muted" htmlFor="label">
          Name
        </label>
        <Input id="label" className="mt-2" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="North line" />
        <label className="mt-4 block text-sm text-muted" htmlFor="country">
          Country
        </label>
        <Select id="country" className="mt-2" value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Select>
        <label className="mt-4 block text-sm text-muted" htmlFor="carrier">
          Carrier
        </label>
        <Input id="carrier" className="mt-2" value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Telstra, Optus, Twilio" />
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
        <Button className="mt-4" type="submit" disabled={pending}>
          {pending ? "Adding" : "Add to pool"}
        </Button>
      </form>
    </Shell>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-lg border border-line p-4">
      <p className="font-display text-sm font-semibold tabular-nums text-faint">{n}</p>
      <h2 className="mt-2 font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </li>
  );
}
