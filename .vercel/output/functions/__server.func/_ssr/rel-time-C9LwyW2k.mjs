import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, X as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rel-time-C9LwyW2k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function absolute(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "UTC"
	}).format(date);
}
function relative(iso) {
	const date = new Date(iso);
	const delta = Date.now() - date.getTime();
	if (Number.isNaN(delta)) return iso;
	const mins = Math.round(delta / 6e4);
	if (mins < 1) return "Just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.round(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
function RelTime({ iso }) {
	const [label, setLabel] = (0, import_react.useState)(() => absolute(iso));
	(0, import_react.useEffect)(() => {
		const tick = () => setLabel(relative(iso));
		tick();
		const id = window.setInterval(tick, 15e3);
		return () => window.clearInterval(id);
	}, [iso]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
		className: "tabular-nums",
		dateTime: iso,
		suppressHydrationWarning: true,
		children: label
	});
}
function isFresh(iso) {
	if (!iso) return false;
	return Date.now() - new Date(iso).getTime() < 9e5;
}
function useFresh(iso) {
	const [fresh, setFresh] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setFresh(isFresh(iso));
	}, [iso]);
	return fresh;
}
//#endregion
export { useFresh as n, RelTime as t };
