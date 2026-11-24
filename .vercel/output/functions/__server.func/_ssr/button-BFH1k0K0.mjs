import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BFH1k0K0.js
var import_jsx_runtime = require_jsx_runtime();
var buttonStyles = cva("inline-flex items-center justify-center gap-2 rounded-sm px-4 font-display text-sm font-semibold tracking-tight transition-[background-color,color,opacity,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40", {
	variants: { variant: {
		primary: "h-11 bg-accent text-accent-fg hover:opacity-90 active:scale-95",
		quiet: "h-11 border border-line bg-elevated text-fg hover:bg-subtle active:scale-95",
		ghost: "h-11 text-muted hover:text-fg"
	} },
	defaultVariants: { variant: "primary" }
});
function Button({ className = "", variant, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: `${buttonStyles({ variant })} ${className}`,
		...props
	});
}
//#endregion
export { Button as t };
