import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

const links = [
  { to: "/", label: "Numbers" },
  { to: "/connect", label: "Connect" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/95">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="font-display text-lg font-semibold tracking-tight text-fg">
            Relay
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const active = link.to === "/" ? pathname === "/" || pathname.startsWith("/n/") : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-sm px-3 py-2 font-display text-sm font-semibold tracking-tight ${
                    active ? "bg-subtle text-fg" : "text-muted hover:text-fg"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
