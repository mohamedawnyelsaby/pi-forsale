"use client";

import { useState } from "react";

type PiSdk = {
  init: (opts: { version: string; sandbox: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void,
  ) => Promise<{ accessToken: string; user: { username: string } }>;
};

declare global {
  interface Window {
    Pi?: PiSdk;
  }
}

export function PiAuth({ label, hint, done }: { label: string; hint: string; done: string }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function signIn() {
    if (!window.Pi) {
      setState("error");
      setMessage(hint);
      return;
    }
    setState("busy");
    try {
      window.Pi.init({ version: "2.0", sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX !== "false" });
      // Incomplete payments are recovered in the payments phase (see ROADMAP.md).
      const auth = await window.Pi.authenticate(["username"], () => {});
      const res = await fetch("/api/auth/pi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("ok");
      setMessage(`${done}: ${auth.user.username}`);
    } catch {
      setState("error");
      setMessage(hint);
    }
  }

  return (
    <div className="pi-auth">
      <button type="button" className="btn btn-ghost" onClick={signIn} disabled={state === "busy"}>
        {label}
      </button>
      {message && (
        <span className={state === "error" ? "pi-msg pi-msg-error" : "pi-msg"} role="status">
          {message}
        </span>
      )}
    </div>
  );
}
