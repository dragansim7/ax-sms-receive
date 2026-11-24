import { useEffect, useState } from "react";

function absolute(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function relative(iso: string) {
  const date = new Date(iso);
  const delta = Date.now() - date.getTime();
  if (Number.isNaN(delta)) return iso;
  const mins = Math.round(delta / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function RelTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => absolute(iso));

  useEffect(() => {
    const tick = () => setLabel(relative(iso));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, [iso]);

  return (
    <time className="tabular-nums" dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}

export function isFresh(iso: string | null) {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < 15 * 60 * 1000;
}

export function useFresh(iso: string | null) {
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    setFresh(isFresh(iso));
  }, [iso]);
  return fresh;
}
