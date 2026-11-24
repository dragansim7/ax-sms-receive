import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-WlaxKyiq.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listNumbers_createServerFn_handler = createServerRpc({
	id: "7c28da9a66c425dfd7ed85430c222ccd7fc2fb399c7ccd700dae9de0e5e178ce",
	name: "listNumbers",
	filename: "src/lib/sms/fns.ts"
}, (opts) => listNumbers.__executeServer(opts));
var listNumbers = createServerFn({ method: "GET" }).handler(listNumbers_createServerFn_handler, async () => {
	const { listNumberCards } = await import("./store.server-Cv8UoRWa.mjs").then((n) => n.n);
	return listNumberCards();
});
var getInbox_createServerFn_handler = createServerRpc({
	id: "f8988de394d156c88d1d8c806ece2d64725f4538a1c4f5c7975048c69c6dc580",
	name: "getInbox",
	filename: "src/lib/sms/fns.ts"
}, (opts) => getInbox.__executeServer(opts));
var getInbox = createServerFn({ method: "GET" }).validator((digits) => digits.replace(/\D/g, "").slice(0, 16)).handler(getInbox_createServerFn_handler, async ({ data }) => {
	const { readInbox } = await import("./store.server-Cv8UoRWa.mjs").then((n) => n.n);
	return readInbox(data);
});
var sendTest_createServerFn_handler = createServerRpc({
	id: "3fcf73b5b3913a6e130edadd397fb7c4b213c8dbb8b1495ec820314a04f85bcf",
	name: "sendTest",
	filename: "src/lib/sms/fns.ts"
}, (opts) => sendTest.__executeServer(opts));
var sendTest = createServerFn({ method: "POST" }).validator((input) => ({
	numberId: String(input.numberId ?? "").replace(/\D/g, "").slice(0, 16),
	fromNumber: String(input.fromNumber ?? "").slice(0, 32),
	senderName: String(input.senderName ?? "").slice(0, 40),
	body: String(input.body ?? "").slice(0, 320)
})).handler(sendTest_createServerFn_handler, async ({ data }) => {
	const { insertSms } = await import("./store.server-Cv8UoRWa.mjs").then((n) => n.n);
	if (!(await (await (await import("./db-DP0OsPMc.mjs").then((n) => n.t)).getSql()).query(`select id from numbers where id = $1 and active = true`, [data.numberId]))[0]) throw new Error("That line is not in the pool");
	return insertSms({
		...data,
		source: "sim"
	});
});
var registerNumber_createServerFn_handler = createServerRpc({
	id: "3bfe859aaa8dbf4e9c7aa98859aab2ede5b155c93c9e92e7fbc11d4daf3d8ea8",
	name: "registerNumber",
	filename: "src/lib/sms/fns.ts"
}, (opts) => registerNumber.__executeServer(opts));
var registerNumber = createServerFn({ method: "POST" }).validator((input) => ({
	e164: String(input.e164 ?? "").slice(0, 20),
	label: String(input.label ?? "").slice(0, 40),
	countryCode: String(input.countryCode ?? "").slice(0, 2),
	carrier: String(input.carrier ?? "").slice(0, 40)
})).handler(registerNumber_createServerFn_handler, async ({ data }) => {
	const { addNumber } = await import("./store.server-Cv8UoRWa.mjs").then((n) => n.n);
	return addNumber(data);
});
var getSetup_createServerFn_handler = createServerRpc({
	id: "b851f49959395843ca52024e7475b6ee577a2af2a94911e7e073e5cae34cb7e8",
	name: "getSetup",
	filename: "src/lib/sms/fns.ts"
}, (opts) => getSetup.__executeServer(opts));
var getSetup = createServerFn({ method: "GET" }).handler(getSetup_createServerFn_handler, async () => {
	const { readSetup } = await import("./store.server-Cv8UoRWa.mjs").then((n) => n.n);
	return readSetup();
});
//#endregion
export { getInbox_createServerFn_handler, getSetup_createServerFn_handler, listNumbers_createServerFn_handler, registerNumber_createServerFn_handler, sendTest_createServerFn_handler };
