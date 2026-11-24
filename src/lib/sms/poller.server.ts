import { getSql } from "@/lib/db";

const TICK_MS = 10_000;

let started = false;
let running = false;

async function tick() {
  if (running) return;
  running = true;
  try {
    const { syncAnosim } = await import("./anosim.server");
    const { syncReceiveSmss } = await import("./receivesmss.server");
    await Promise.all([syncAnosim(), syncReceiveSmss()]);
  } catch {
    // a failed tick must not stop the loop
  } finally {
    running = false;
  }
}

/** Keep pulling public inboxes while the server is up, even with no browser open. */
export function startPoller() {
  if (started) return;
  started = true;
  void tick();
  setInterval(() => {
    void tick();
  }, TICK_MS);
}
