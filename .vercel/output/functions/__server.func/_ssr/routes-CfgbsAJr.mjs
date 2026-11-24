import { o as __toESM } from "../_runtime.mjs";
import { i as displayE164 } from "./store.server-Cv8UoRWa.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Radio } from "../_libs/lucide-react.mjs";
import { i as Route$3, o as listNumbers } from "./router-CM3LS1_P.mjs";
import { r as Shell, t as Input } from "./input-CB4Ey-L4.mjs";
import { n as useFresh, t as RelTime } from "./rel-time-C9LwyW2k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CfgbsAJr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const initial = Route$3.useLoaderData();
	const [rows, setRows] = (0, import_react.useState)(initial);
	const [query, setQuery] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("ALL");
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			listNumbers().then(setRows).catch(() => void 0);
		}, 8e3);
		return () => window.clearInterval(id);
	}, []);
	const countries = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of rows) map.set(row.countryCode, row.countryName);
		return [...map.entries()];
	}, [rows]);
	const filtered = rows.filter((row) => {
		if (country !== "ALL" && row.countryCode !== country) return false;
		return `${row.e164} ${row.label} ${row.carrier} ${row.countryName} ${row.preview ?? ""}`.toLowerCase().includes(query.trim().toLowerCase());
	});
	const featured = filtered.find((row) => row.countryCode === "AU" && row.lastAt) ?? filtered[0];
	const rest = filtered.filter((row) => row.id !== featured?.id);
	const dayTotal = rows.reduce((sum, row) => sum + row.dayCount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rise max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-semibold tracking-tight text-muted",
					children: "Public inbox"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-hero font-semibold leading-tight text-fg",
					children: "Receive SMS without handing over your number."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-xl text-muted",
					children: "Pick a live line, paste it into the form that asked, then read the code here. Messages stay public and drop off after 48 hours."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-8 grid grid-cols-3 gap-3 border-y border-line py-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Lines",
					value: String(rows.length)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "In 24 hours",
					value: String(dayTotal)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Retention",
					value: "48h"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "sr-only",
					htmlFor: "search",
					children: "Search numbers"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "search",
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Search a number, carrier, or sender",
					className: "sm:max-w-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 overflow-x-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						active: country === "ALL",
						onClick: () => setCountry("ALL"),
						children: "All"
					}), countries.map(([code, name]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
						active: country === code,
						onClick: () => setCountry(code),
						children: name
					}, code))]
				})
			]
		}),
		featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/n/$digits",
			params: { digits: featured.id },
			className: "rise mt-6 block rounded-xl border border-line bg-elevated p-4 hover:bg-subtle",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberBody, {
				row: featured,
				featured: true
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-muted",
			children: "No lines match that search."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 divide-y divide-line border-t border-line",
			children: rest.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/n/$digits",
				params: { digits: row.id },
				className: "block rounded-sm py-4 hover:bg-elevated",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumberBody, { row })
			}) }, row.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 max-w-xl text-sm text-faint",
			children: "Anyone can read these inboxes. Do not use them for banking, password recovery, or anything you would not put on a noticeboard."
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-faint",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-display text-title font-semibold tabular-nums tracking-tight text-fg",
		children: value
	})] });
}
function FilterChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `h-11 shrink-0 rounded-full px-4 font-display text-sm font-semibold tracking-tight ${active ? "bg-accent text-accent-fg" : "border border-line text-muted hover:text-fg"}`,
		children
	});
}
function NumberBody({ row, featured = false }) {
	const fresh = useFresh(row.lastAt);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-xs border border-line px-1.5 py-0.5 font-display text-xs font-semibold text-muted",
						children: row.countryCode
					}), fresh ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 text-xs text-live",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, {
							className: "size-3 live-dot",
							"aria-hidden": "true"
						}), "Live"]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `mt-2 font-display font-semibold tabular-nums tracking-tight text-fg ${featured ? "text-title" : "text-lg"}`,
					children: displayE164(row.e164)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						row.label,
						" · ",
						row.carrier
					]
				}),
				row.preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 truncate text-sm text-faint",
					children: [row.senderName ? `${row.senderName}: ` : "", row.preview]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-faint",
					children: "No messages yet"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shrink-0 text-right",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-semibold tabular-nums text-fg",
					children: row.dayCount
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-faint",
					children: "24h"
				}),
				row.lastAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelTime, { iso: row.lastAt })
				}) : null
			]
		})]
	});
}
//#endregion
export { Home as component };
