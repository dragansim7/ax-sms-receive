import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell } from "@/components/shell";
import { RelTime } from "@/components/rel-time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFreshCounts, listNumbers, removeNumbers } from "@/lib/sms/fns";
import { displayE164 } from "@/lib/sms/format";
import { baselineFor, getLastVisit, setLastVisit } from "@/lib/sms/seen";
import type { NumberCard } from "@/lib/sms/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Relay — public SMS inboxes" }],
  }),
  loader: () => listNumbers(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  const [rows, setRows] = useState(initial);
  const [fresh, setFresh] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("ALL");
  const [managing, setManaging] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getLastVisit()) setLastVisit(new Date().toISOString());

    async function refresh() {
      const next = await listNumbers();
      setRows(next);
      const seen: Record<string, string> = {};
      for (const row of next) seen[row.id] = baselineFor(row.id);
      const counts = await getFreshCounts({ data: seen });
      setFresh(counts);
    }

    const id = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, 10_000);
    refresh().catch(() => undefined);

    function remember() {
      setLastVisit(new Date().toISOString());
    }
    function onHide() {
      if (document.visibilityState === "hidden") remember();
    }
    window.addEventListener("pagehide", remember);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(id);
      remember();
      window.removeEventListener("pagehide", remember);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, []);

  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) map.set(row.countryCode, row.countryName);
    return [...map.entries()];
  }, [rows]);

  const filtered = rows.filter((row) => {
    if (country !== "ALL" && row.countryCode !== country) return false;
    const hay = `${row.e164} ${row.label} ${row.carrier} ${row.countryName} ${row.preview ?? ""}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  const featured = filtered.find((row) => row.countryCode === "AU" && row.lastAt) ?? filtered[0];
  const rest = filtered.filter((row) => row.id !== featured?.id);
  const dayTotal = rows.reduce((sum, row) => sum + row.dayCount, 0);
  const selectedCount = selected.size;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleManage() {
    setManaging((on) => !on);
    setSelected(new Set());
    setError("");
  }

  async function removeSelected() {
    if (selectedCount === 0) return;
    setRemoving(true);
    setError("");
    try {
      await removeNumbers({ data: [...selected] });
      const next = await listNumbers();
      setRows(next);
      setSelected(new Set());
      if (next.length === 0) setManaging(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove those lines");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <Shell>
      <section className="rise max-w-2xl">
        <p className="font-display text-sm font-semibold tracking-tight text-muted">Public inbox</p>
        <h1 className="mt-2 text-hero font-semibold leading-tight text-fg">
          Receive SMS without handing over your number.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Pick a live line, paste it into the form that asked, then read the code here. Messages stay public and drop off after 48 hours.
        </p>
      </section>

      <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-line py-4">
        <Stat label="Lines" value={String(rows.length)} />
        <Stat label="In 24 hours" value={String(dayTotal)} />
        <Stat label="Retention" value="48h" />
      </dl>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="search">
          Search numbers
        </label>
        <Input
          id="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a number, carrier, or sender"
          className="sm:max-w-sm"
        />
        <div className="flex gap-2 overflow-x-auto">
          <FilterChip active={country === "ALL"} onClick={() => setCountry("ALL")}>
            All
          </FilterChip>
          {countries.map(([code, name]) => (
            <FilterChip key={code} active={country === code} onClick={() => setCountry(code)}>
              {name}
            </FilterChip>
          ))}
        </div>
        {rows.length > 0 ? (
          <Button variant="quiet" className="sm:ml-auto" onClick={toggleManage}>
            {managing ? "Done" : "Select"}
          </Button>
        ) : null}
      </div>

      {managing && selectedCount > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-elevated px-4 py-3">
          <p className="font-display text-sm font-semibold text-fg">{selectedCount} selected</p>
          <Button variant="quiet" className="text-danger" disabled={removing} onClick={removeSelected}>
            {removing ? "Removing" : "Remove selected"}
          </Button>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      ) : null}

      {featured ? (
        <div className="rise mt-6 flex items-start gap-3 rounded-xl border border-line bg-elevated p-4 hover:bg-subtle">
          {managing ? (
            <SelectBox checked={selected.has(featured.id)} onChange={() => toggle(featured.id)} label={featured.e164} />
          ) : null}
          <Link to="/n/$digits" params={{ digits: featured.id }} className="block min-w-0 flex-1">
            <NumberBody row={featured} featured unseen={fresh[featured.id] ?? 0} />
          </Link>
        </div>
      ) : (
        <p className="mt-8 text-muted">
          {rows.length === 0
            ? "No lines yet. Add one from Connect."
            : "No lines match that search."}
        </p>
      )}

      <ul className="mt-3 divide-y divide-line border-t border-line">
        {rest.map((row) => (
          <li key={row.id} className="flex items-start gap-3 py-4">
            {managing ? (
              <SelectBox checked={selected.has(row.id)} onChange={() => toggle(row.id)} label={row.e164} />
            ) : null}
            <Link to="/n/$digits" params={{ digits: row.id }} className="block min-w-0 flex-1 rounded-sm hover:bg-elevated">
              <NumberBody row={row} unseen={fresh[row.id] ?? 0} />
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-8 max-w-xl text-sm text-faint">
        Anyone can read these inboxes. Do not use them for banking, password recovery, or anything you would not put on a noticeboard.
      </p>
    </Shell>
  );
}

function SelectBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={`Select ${label}`}
      className="mt-1 size-5 shrink-0 accent-accent"
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="font-display text-title font-semibold tabular-nums tracking-tight text-fg">{value}</dd>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 shrink-0 rounded-full px-4 font-display text-sm font-semibold tracking-tight ${
        active ? "bg-accent text-accent-fg" : "border border-line text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  );
}

function NumberBody({
  row,
  featured = false,
  unseen = 0,
}: {
  row: NumberCard;
  featured?: boolean;
  unseen?: number;
}) {
  const active = isActive(row.lastAt);
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <StatusDot active={active} />
          <span className="rounded-xs border border-line px-1.5 py-0.5 font-display text-xs font-semibold text-muted">
            {row.countryCode}
          </span>
          <span className={`text-xs ${active ? "text-live" : "text-danger"}`}>{active ? "Active" : "Inactive"}</span>
          {unseen > 0 ? (
            <span className="rounded-full bg-accent px-2 py-0.5 font-display text-xs font-semibold text-accent-fg">
              {unseen} new
            </span>
          ) : null}
        </div>
        <p className={`mt-2 font-display font-semibold tabular-nums tracking-tight text-fg ${featured ? "text-title" : "text-lg"}`}>
          {displayE164(row.e164)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {row.label} · {row.carrier}
        </p>
        {row.preview ? (
          <p className="mt-2 truncate text-sm text-faint">
            {row.senderName ? `${row.senderName}: ` : ""}
            {row.preview}
          </p>
        ) : (
          <p className="mt-2 text-sm text-faint">No messages yet</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display text-sm font-semibold tabular-nums text-fg">{row.dayCount}</p>
        <p className="text-xs text-faint">24h</p>
        {row.lastAt ? (
          <p className="mt-2 text-xs text-muted">
            <RelTime iso={row.lastAt} />
          </p>
        ) : null}
      </div>
    </div>
  );
}

function isActive(iso: string | null) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 60 * 60 * 1000;
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={active ? "status-dot status-dot-live" : "status-dot status-dot-dead"}
      role="img"
      aria-label={active ? "Active" : "Inactive"}
    />
  );
}
