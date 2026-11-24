import { n as getSql, r as __exportAll } from "./db-DP0OsPMc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store.server-Cv8UoRWa.js
function digitsOnly(input) {
	return input.replace(/\D/g, "");
}
function normalizeE164(input) {
	const digits = digitsOnly(input);
	if (!digits) return "";
	return `+${digits}`;
}
function isE164(value) {
	return /^\+[1-9]\d{7,14}$/.test(value);
}
function displayE164(e164) {
	if (e164.startsWith("+61") && e164.length === 12) {
		const d = e164.slice(3);
		return `+61 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
	}
	if (e164.startsWith("+44") && e164.length >= 12) {
		const d = e164.slice(3);
		return `+44 ${d.slice(0, 4)} ${d.slice(4)}`;
	}
	if (e164.startsWith("+1") && e164.length === 12) {
		const d = e164.slice(2);
		return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
	}
	return e164;
}
function localFormat(e164) {
	if (e164.startsWith("+61") && e164.length === 12) {
		const d = e164.slice(3);
		return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
	}
	return null;
}
var store_server_exports = /* @__PURE__ */ __exportAll({
	acceptInbound: () => acceptInbound,
	addNumber: () => addNumber,
	insertSms: () => insertSms,
	listNumberCards: () => listNumberCards,
	readInbox: () => readInbox,
	readSetup: () => readSetup,
	webhookAuthorized: () => webhookAuthorized
});
var CAP = 40;
function mapNumber(row) {
	return {
		id: row.id,
		e164: row.e164,
		countryCode: row.country_code,
		countryName: row.country_name,
		label: row.label,
		carrier: row.carrier,
		dayCount: Number(row.day_count ?? 0),
		lastAt: row.last_at,
		preview: row.preview,
		senderName: row.sender_name
	};
}
async function prune(sql) {
	await sql.query(`delete from messages where received_at < now() - interval '48 hours'`);
}
var NUMBER_SELECT = `
  select
    n.id,
    n.e164,
    n.country_code,
    n.country_name,
    n.label,
    n.carrier,
    coalesce(day.day_count, 0) as day_count,
    last.last_at,
    last.preview,
    last.sender_name
  from numbers n
  left join lateral (
    select
      to_char(m.received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as last_at,
      m.body as preview,
      m.sender_name
    from messages m
    where m.number_id = n.id
    order by m.received_at desc
    limit 1
  ) last on true
  left join lateral (
    select count(*)::int as day_count
    from messages m
    where m.number_id = n.id
      and m.received_at > now() - interval '24 hours'
  ) day on true
`;
async function listNumberCards() {
	const sql = await getSql();
	await prune(sql);
	return (await sql.query(`${NUMBER_SELECT}
     where n.active = true
     order by (n.country_code = 'AU') desc, last.last_at desc nulls last, n.label asc`)).map(mapNumber);
}
async function readInbox(digits) {
	const id = digits.replace(/\D/g, "");
	if (!id) return null;
	const sql = await getSql();
	await prune(sql);
	const number = (await sql.query(`${NUMBER_SELECT} where n.id = $1 and n.active = true`, [id]))[0];
	if (!number) return null;
	const mapped = (await sql.query(`select
       id,
       from_number,
       sender_name,
       body,
       to_char(received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as received_at,
       source
     from messages
     where number_id = $1
     order by received_at desc
     limit 50`, [id])).map((m) => ({
		id: Number(m.id),
		fromNumber: m.from_number,
		senderName: m.sender_name,
		body: m.body,
		receivedAt: m.received_at,
		source: m.source
	}));
	return {
		number: mapNumber(number),
		messages: mapped
	};
}
function cleanBody(body, max) {
	return body.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}
async function insertSms(input) {
	const sql = await getSql();
	const body = cleanBody(input.body, input.source === "sim" ? 320 : 640);
	if (!body) throw new Error("Message is empty");
	const fromNumber = input.fromNumber.trim().slice(0, 32) || "Unknown";
	const senderName = input.senderName.trim().slice(0, 40);
	if (input.source === "sim") {
		const recent = await sql.query(`select count(*)::int as recent
       from messages
       where number_id = $1
         and source = 'sim'
         and received_at > now() - interval '3 seconds'`, [input.numberId]);
		if (Number(recent[0]?.recent ?? 0) > 0) throw new Error("Wait a few seconds before sending another test");
	} else {
		const burst = await sql.query(`select count(*)::int as recent
       from messages
       where number_id = $1
         and received_at > now() - interval '1 minute'`, [input.numberId]);
		if (Number(burst[0]?.recent ?? 0) >= 20) throw new Error("This line is receiving too fast");
	}
	const row = (await sql.query(`insert into messages (number_id, from_number, sender_name, body, source)
     values ($1, $2, $3, $4, $5)
     returning
       id,
       from_number,
       sender_name,
       body,
       to_char(received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as received_at,
       source`, [
		input.numberId,
		fromNumber,
		senderName,
		body,
		input.source
	]))[0];
	if (!row) throw new Error("Could not store the message");
	return {
		id: Number(row.id),
		fromNumber: row.from_number,
		senderName: row.sender_name,
		body: row.body,
		receivedAt: row.received_at,
		source: row.source
	};
}
async function acceptInbound(to, from, body) {
	const e164 = normalizeE164(to);
	if (!isE164(e164)) throw new Error("Unknown destination");
	const id = e164.slice(1);
	if (!(await (await getSql()).query(`select id from numbers where id = $1 and active = true`, [id]))[0]) throw new Error("Unknown destination");
	const senderName = guessSender(from, body);
	return insertSms({
		numberId: id,
		fromNumber: normalizeE164(from) || from.slice(0, 32) || "Unknown",
		senderName,
		body,
		source: "webhook"
	});
}
function guessSender(from, body) {
	const hay = `${from} ${body}`.toLowerCase();
	for (const name of [
		"telegram",
		"google",
		"discord",
		"instagram",
		"signal",
		"whatsapp"
	]) if (hay.includes(name)) return name[0].toUpperCase() + name.slice(1);
	return "";
}
var COUNTRIES = {
	AU: "Australia",
	GB: "United Kingdom",
	US: "United States",
	CA: "Canada",
	NZ: "New Zealand",
	DE: "Germany",
	NL: "Netherlands"
};
async function addNumber(input) {
	const e164 = normalizeE164(input.e164);
	if (!isE164(e164)) throw new Error("Use a full international number, like +61468001999");
	const countryCode = input.countryCode.toUpperCase();
	const countryName = COUNTRIES[countryCode];
	if (!countryName) throw new Error("Pick a supported country");
	const label = input.label.trim().slice(0, 40);
	if (label.length < 2) throw new Error("Give the line a short name");
	const carrier = input.carrier.trim().slice(0, 40) || "Virtual";
	const id = e164.slice(1);
	const sql = await getSql();
	const countRows = await sql.query(`select count(*)::int as n from numbers`);
	if (Number(countRows[0]?.n ?? 0) >= CAP) throw new Error("The pool is full");
	if ((await sql.query(`select id from numbers where id = $1`, [id]))[0]) throw new Error("That number is already in the pool");
	await sql.query(`insert into numbers (id, e164, country_code, country_name, label, carrier)
     values ($1, $2, $3, $4, $5, $6)`, [
		id,
		e164,
		countryCode,
		countryName,
		label,
		carrier
	]);
	const row = (await sql.query(`${NUMBER_SELECT} where n.id = $1`, [id]))[0];
	if (!row) throw new Error("Could not add the number");
	return mapNumber(row);
}
async function readSetup() {
	const rows = await (await getSql()).query(`select count(*)::int as n from numbers where active = true`);
	return {
		secretConfigured: Boolean(process.env.SMS_WEBHOOK_SECRET?.trim()),
		numberCount: Number(rows[0]?.n ?? 0),
		cap: CAP
	};
}
function webhookAuthorized(request) {
	const expected = process.env.SMS_WEBHOOK_SECRET?.trim();
	if (!expected) return true;
	return request.headers.get("x-relay-secret") === expected;
}
//#endregion
export { localFormat as a, displayE164 as i, store_server_exports as n, webhookAuthorized as r, acceptInbound as t };
