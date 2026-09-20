// Thin server-side wrapper around the Pi Platform API.
// The API key must never reach the browser: import this file from server code only.
const PI_API = "https://api.minepi.com/v2";

export type PiUser = { uid: string; username: string };

export type PiPayment = {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: { txid: string; verified: boolean; _link: string } | null;
};

function apiKey(): string {
  const key = process.env.PI_API_KEY;
  if (!key) throw new Error("PI_API_KEY is not set");
  return key;
}

async function piFetch<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${PI_API}${path}`, { ...init, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Pi API ${path} failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

/** Verifies a user's access token (from Pi.authenticate) and returns who it belongs to. */
export async function verifyAccessToken(accessToken: string): Promise<PiUser> {
  const me = await piFetch<{ uid: string; username: string }>("/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return { uid: me.uid, username: me.username };
}

export function getPayment(paymentId: string) {
  return piFetch<PiPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Key ${apiKey()}` },
  });
}

export function approvePayment(paymentId: string) {
  return piFetch<PiPayment>(`/payments/${encodeURIComponent(paymentId)}/approve`, {
    method: "POST",
    headers: { Authorization: `Key ${apiKey()}` },
  });
}

export function completePayment(paymentId: string, txid: string) {
  return piFetch<PiPayment>(`/payments/${encodeURIComponent(paymentId)}/complete`, {
    method: "POST",
    headers: { Authorization: `Key ${apiKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ txid }),
  });
}
