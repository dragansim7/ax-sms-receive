import { C as require_jsx_runtime, b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CB4Ey-L4.js
var import_jsx_runtime = require_jsx_runtime();
var links = [{
	to: "/",
	label: "Numbers"
}, {
	to: "/connect",
	label: "Connect"
}];
function Shell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-10 border-b border-line bg-bg/95",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-5xl items-center justify-between px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "font-display text-lg font-semibold tracking-tight text-fg",
					children: "Relay"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex items-center gap-1",
					children: links.map((link) => {
						const active = link.to === "/" ? pathname === "/" || pathname.startsWith("/n/") : pathname.startsWith(link.to);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: link.to,
							className: `rounded-sm px-3 py-2 font-display text-sm font-semibold tracking-tight ${active ? "bg-subtle text-fg" : "text-muted hover:text-fg"}`,
							children: link.label
						}, link.to);
					})
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-5xl px-4 py-8",
			children
		})]
	});
}
var field = "w-full rounded-sm border border-line bg-bg px-3 text-fg outline-none placeholder:text-faint";
function Input({ className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: `${field} h-11 ${className}`,
		...props
	});
}
function Textarea({ className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: `${field} min-h-28 py-3 leading-normal ${className}`,
		...props
	});
}
function Select({ className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: `${field} h-11 ${className}`,
		...props
	});
}
//#endregion
export { Textarea as i, Select as n, Shell as r, Input as t };
