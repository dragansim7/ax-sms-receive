import { o as __toESM } from "./_runtime.mjs";
import { a as localFormat, i as displayE164 } from "./_ssr/store.server-Cv8UoRWa.mjs";
import { C as require_jsx_runtime, X as require_react, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { i as ArrowLeft, r as Copy } from "./_libs/lucide-react.mjs";
import { a as getInbox, c as sendTest, n as Route$1 } from "./_ssr/router-CM3LS1_P.mjs";
import { i as Textarea, r as Shell } from "./_ssr/input-CB4Ey-L4.mjs";
import { t as Button } from "./_ssr/button-BFH1k0K0.mjs";
import { n as useFresh, t as RelTime } from "./_ssr/rel-time-C9LwyW2k.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_digits-C4N7Vwj8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PRESETS = [
	{
		senderName: "Telegram",
		fromNumber: "+42777",
		body: "Telegram code: 184920"
	},
	{
		senderName: "Google",
		fromNumber: "Google",
		body: "G-184223 is your Google verification code."
	},
	{
		senderName: "Discord",
		fromNumber: "+447781",
		body: "Your Discord verification code is 091284"
	}
];
function InboxPage() {
	const initial = Route$1.useLoaderData();
	const { digits } = Route$1.useParams();
	const [payload, setPayload] = (0, import_react.useState)(initial);
	const [preset, setPreset] = (0, import_react.useState)(0);
	const [body, setBody] = (0, import_react.useState)(PRESETS[0].body);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			getInbox({ data: digits }).then((next) => {
				if (next) setPayload(next);
			}).catch(() => void 0);
		}, 4e3);
		return () => window.clearInterval(id);
	}, [digits]);
	if (!payload) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-title font-semibold",
		children: "This line is not in the pool."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		className: "mt-4 inline-block text-sm text-muted",
		children: "Back to numbers"
	})] });
	const { number, messages } = payload;
	const local = localFormat(number.e164);
	const fresh = useFresh(number.lastAt);
	async function copy(value, key) {
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
		const chosen = PRESETS[preset] ?? PRESETS[0];
		try {
			await sendTest({ data: {
				numberId: number.id,
				fromNumber: chosen.fromNumber,
				senderName: chosen.senderName,
				body
			} });
			const next = await getInbox({ data: digits });
			if (next) setPayload(next);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not send");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/",
			className: "inline-flex items-center gap-2 text-sm text-muted hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
				className: "size-4",
				"aria-hidden": "true"
			}), "Numbers"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap items-end justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: number.countryName }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: number.label }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: number.carrier }),
					fresh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-live",
						children: "Live"
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-title font-semibold tabular-nums leading-none",
				children: displayE164(number.e164)
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "quiet",
					onClick: () => copy(number.e164, "intl"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
						className: "size-4",
						"aria-hidden": "true"
					}), copied === "intl" ? "Copied" : "Copy number"]
				}), local ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "quiet",
					onClick: () => copy(local.replace(/\s/g, ""), "local"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
						className: "size-4",
						"aria-hidden": "true"
					}), copied === "local" ? "Copied" : "Copy local"]
				}) : null]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 grid items-start gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold tracking-tight text-muted",
					children: "Inbox"
				}), messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 rounded-xl border border-line bg-elevated p-4 text-muted",
					children: "Nothing yet. Send a test, or point your provider webhook at this line."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 divide-y divide-line border-t border-line",
					children: messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageRow, { message }, message.id))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "rounded-xl border border-line bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold tracking-tight",
						children: "Send a test SMS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Lands in this inbox like a provider webhook. Refreshes on its own."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: PRESETS.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setPreset(index);
								setBody(item.body);
							},
							className: `h-11 rounded-full px-4 font-display text-sm font-semibold ${preset === index ? "bg-accent text-accent-fg" : "border border-line text-muted"}`,
							children: item.senderName
						}, item.senderName))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "mt-4 block text-sm text-muted",
						htmlFor: "body",
						children: "Message"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						id: "body",
						className: "mt-2",
						value: body,
						maxLength: 320,
						onChange: (event) => setBody(event.target.value)
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4 w-full",
						disabled: pending || body.trim().length === 0,
						onClick: onSend,
						children: pending ? "Sending" : "Deliver to inbox"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-xs text-faint",
						children: [
							"This page is public. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/connect",
								className: "text-muted underline",
								children: "Connect a real number"
							}),
							" if you need a line you control."
						]
					})
				]
			})]
		})
	] });
}
function MessageRow({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-semibold text-fg",
					children: message.senderName || message.fromNumber
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-faint",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RelTime, { iso: message.receivedAt })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-fg",
				children: message.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-faint",
				children: [message.fromNumber, message.source === "sim" ? " · test" : message.source === "webhook" ? " · webhook" : ""]
			})
		]
	});
}
//#endregion
export { InboxPage as component };
