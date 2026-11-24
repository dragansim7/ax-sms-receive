//#region node_modules/.nitro/vite/services/ssr/assets/db-DP0OsPMc.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var _0002_relay_default = "create table if not exists numbers (\n  id text primary key,\n  e164 text not null unique,\n  country_code text not null,\n  country_name text not null,\n  label text not null,\n  carrier text not null default 'Virtual',\n  active boolean not null default true,\n  added_at timestamptz not null default now()\n);\n\ncreate table if not exists messages (\n  id bigserial primary key,\n  number_id text not null references numbers (id),\n  from_number text not null,\n  sender_name text not null default '',\n  body text not null,\n  source text not null default 'webhook',\n  received_at timestamptz not null default now()\n);\n\ncreate index if not exists messages_number_received_idx\n  on messages (number_id, received_at desc);\n\ninsert into numbers (id, e164, country_code, country_name, label, carrier)\nvalues\n  ('61468001001', '+61468001001', 'AU', 'Australia', 'North line', 'Optus'),\n  ('61468001024', '+61468001024', 'AU', 'Australia', 'South line', 'Telstra'),\n  ('61485022018', '+61485022018', 'AU', 'Australia', 'East line', 'Vodafone'),\n  ('61480033042', '+61480033042', 'AU', 'Australia', 'West line', 'Optus'),\n  ('447700900101', '+447700900101', 'GB', 'United Kingdom', 'Thames', 'Virtual'),\n  ('447700900218', '+447700900218', 'GB', 'United Kingdom', 'Mersey', 'Virtual'),\n  ('12025550141', '+12025550141', 'US', 'United States', 'Capitol', 'Virtual'),\n  ('14155550198', '+14155550198', 'US', 'United States', 'Bay', 'Virtual'),\n  ('16045550122', '+16045550122', 'CA', 'Canada', 'Harbour', 'Virtual')\non conflict (id) do nothing;\n\ninsert into messages (number_id, from_number, sender_name, body, source, received_at)\nselect v.number_id, v.from_number, v.sender_name, v.body, 'seed', v.received_at\nfrom (\n  values\n    ('61468001001', '+42777', 'Telegram', 'Telegram code: 184920', now() - interval '6 minutes'),\n    ('61468001001', '+447781', 'Discord', 'Your Discord verification code is 091284', now() - interval '2 hours'),\n    ('61468001024', 'Google', 'Google', 'G-184223 is your Google verification code.', now() - interval '18 minutes'),\n    ('61485022018', '+447700', 'Signal', 'Signal code: 552910', now() - interval '3 hours'),\n    ('61480033042', 'Instagram', 'Instagram', '649201 is your Instagram code', now() - interval '26 hours'),\n    ('447700900101', '+42777', 'Telegram', 'Telegram code: 773041', now() - interval '41 minutes'),\n    ('12025550141', 'Google', 'Google', 'G-902114 is your Google verification code.', now() - interval '9 hours'),\n    ('16045550122', '+447781', 'Discord', 'Your Discord verification code is 220184', now() - interval '5 hours')\n) as v(number_id, from_number, sender_name, body, received_at)\nwhere not exists (select 1 from messages limit 1);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var db_exports = /* @__PURE__ */ __exportAll({
	dbSource: () => dbSource,
	ensureDbReady: () => ensureDbReady,
	getSql: () => getSql
});
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_relay.sql": _0002_relay_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
//#endregion
export { getSql as n, __exportAll as r, db_exports as t };
