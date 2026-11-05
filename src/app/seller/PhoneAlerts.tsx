"use client";

import { useEffect, useState } from "react";

type State = "checking" | "unsupported" | "blocked" | "off" | "on" | "working";

const base64ToBytes = (b64: string) => {
  const padded = (b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
};

/** Turns phone alerts (web push) on or off for this device. */
export function PhoneAlerts() {
  const [state, setState] = useState<State>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      if (Notification.permission === "denied") return setState("blocked");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  async function turnOn() {
    setState("working");
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "blocked" : "off");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const { publicKey } = await (await fetch("/seller/api/push")).json();
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToBytes(publicKey) });
      const res = await fetch("/seller/api/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub) });
      if (!res.ok) throw new Error("Could not save");
      await fetch("/seller/api/push", { method: "PUT" });
      setState("on");
      setMessage("Done. A test alert is on its way to this phone.");
    } catch (e) {
      setState("off");
      setMessage(`Could not turn on alerts: ${(e as Error).message}`);
    }
  }

  async function turnOff() {
    setState("working");
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await fetch("/seller/api/push", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    setState("off");
    setMessage(null);
  }

  async function test() {
    setMessage("Test alert sent.");
    await fetch("/seller/api/push", { method: "PUT" });
  }

  if (state === "checking") return null;

  return (
    <section className="mx-4 mb-4 rounded-xl border border-line bg-card p-3" aria-live="polite">
      {state === "on" ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex-1 font-semibold text-green">✓ Phone alerts are on</span>
          <button type="button" onClick={test} className="min-h-10 rounded-lg border border-line px-3 text-sm font-semibold">
            Test
          </button>
          <button type="button" onClick={turnOff} className="min-h-10 rounded-lg px-2 text-sm text-muted underline">
            Turn off
          </button>
        </div>
      ) : state === "unsupported" ? (
        <p className="text-sm text-muted">Phone alerts need Chrome on Android. Check the bell for new sales.</p>
      ) : state === "blocked" ? (
        <p className="text-sm text-amber-ink">
          Alerts are blocked. In Chrome, tap the lock icon next to the address → Permissions → Notifications → Allow. Then reload.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-[15px]">Get an alert on this phone when a goat is sold.</p>
          <button
            type="button"
            onClick={turnOn}
            disabled={state === "working"}
            className="min-h-12 rounded-xl bg-green font-bold text-white disabled:opacity-60"
          >
            {state === "working" ? "Turning on…" : "Turn on phone alerts"}
          </button>
        </div>
      )}
      {message && <p className="mt-2 text-sm text-muted">{message}</p>}
    </section>
  );
}
