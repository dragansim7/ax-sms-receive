import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Route$2, s as registerNumber } from "./router-CM3LS1_P.mjs";
import { n as Select, r as Shell, t as Input } from "./input-CB4Ey-L4.mjs";
import { t as Button } from "./button-BFH1k0K0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/connect-CTCYoa0T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COUNTRIES = [
	{
		code: "AU",
		name: "Australia"
	},
	{
		code: "GB",
		name: "United Kingdom"
	},
	{
		code: "US",
		name: "United States"
	},
	{
		code: "CA",
		name: "Canada"
	},
	{
		code: "NZ",
		name: "New Zealand"
	},
	{
		code: "DE",
		name: "Germany"
	},
	{
		code: "NL",
		name: "Netherlands"
	}
];
function ConnectPage() {
	const setup = Route$2.useLoaderData();
	const navigate = useNavigate();
	const [e164, setE164] = (0, import_react.useState)("+61");
	const [label, setLabel] = (0, import_react.useState)("");
	const [countryCode, setCountryCode] = (0, import_react.useState)("AU");
	const [carrier, setCarrier] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(event) {
		event.preventDefault();
		setPending(true);
		setError("");
		try {
			const number = await registerNumber({ data: {
				e164,
				label,
				countryCode,
				carrier
			} });
			await navigate({
				to: "/n/$digits",
				params: { digits: number.id }
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not add that number");
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "max-w-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-sm font-semibold tracking-tight text-muted",
					children: "Connect"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-hero font-semibold leading-tight",
					children: "Point a real number at Relay."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-muted",
					children: "Rent a mobile number from Twilio, Telnyx, or Vonage. Add it here, then set that provider’s SMS webhook to this app. Inbound texts show up on the public inbox for that line."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "mt-8 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: "1",
					title: "Buy a mobile line",
					body: "It has to be a real SMS-capable number, not a landline. Australian mobiles look like +61 4xx xxx xxx."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: "2",
					title: "Register it",
					body: "Relay only stores messages for numbers in this pool, so unknown destinations are rejected."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
					n: "3",
					title: "Set the webhook",
					body: "POST form fields To, From, and Body, or JSON with to, from, and body. Telnyx’s message payload works too."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-8 rounded-xl border border-line bg-elevated p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Webhook"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						"Path ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-fg",
							children: "/api/sms/inbound"
						}),
						" · ",
						setup.secretConfigured ? "A shared secret is set. Send it as the x-relay-secret header." : "No shared secret is configured, so the webhook is open for numbers already in the pool."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-4 overflow-x-auto rounded-md bg-bg p-3 text-sm text-muted",
					children: `POST /api/sms/inbound
Content-Type: application/x-www-form-urlencoded

To=%2B61468001001&From=%2B42777&Body=Telegram+code%3A+184920`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit,
			className: "mt-8 max-w-lg rounded-xl border border-line p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Add a line"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						setup.numberCount,
						" of ",
						setup.cap,
						" slots used. Adding a number does not buy it. You still need the carrier to deliver SMS here."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-sm text-muted",
					htmlFor: "e164",
					children: "Number"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "e164",
					className: "mt-2",
					value: e164,
					onChange: (event) => setE164(event.target.value),
					inputMode: "tel",
					autoComplete: "off"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-sm text-muted",
					htmlFor: "label",
					children: "Name"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "label",
					className: "mt-2",
					value: label,
					onChange: (event) => setLabel(event.target.value),
					placeholder: "North line"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-sm text-muted",
					htmlFor: "country",
					children: "Country"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					id: "country",
					className: "mt-2",
					value: countryCode,
					onChange: (event) => setCountryCode(event.target.value),
					children: COUNTRIES.map((country) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: country.code,
						children: country.name
					}, country.code))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-4 block text-sm text-muted",
					htmlFor: "carrier",
					children: "Carrier"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "carrier",
					className: "mt-2",
					value: carrier,
					onChange: (event) => setCarrier(event.target.value),
					placeholder: "Telstra, Optus, Twilio"
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					type: "submit",
					disabled: pending,
					children: pending ? "Adding" : "Add to pool"
				})
			]
		})
	] });
}
function Step({ n, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg border border-line p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-sm font-semibold tabular-nums text-faint",
				children: n
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: body
			})
		]
	});
}
//#endregion
export { ConnectPage as component };
